import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { recordInternationalInbound } from "../db";
import { invokeLLM } from "./llm";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/email/inbound", async (req, res) => {
    const configuredSecret = process.env.INTERNATIONAL_INBOUND_WEBHOOK_SECRET;
    if (!configuredSecret || req.header("x-edgespark-inbound-secret") !== configuredSecret) {
      res.status(401).json({ error: "Inbound webhook is not authorized" });
      return;
    }
    const { placeId, fromEmail, toEmail, subject, text, bodyText, messageId, aiSummary, aiSuggestedReply } = req.body || {};
    if (typeof placeId !== "string" || typeof (text || bodyText) !== "string") {
      res.status(400).json({ error: "placeId and text are required" });
      return;
    }
    try {
      let generatedSummary = aiSummary;
      let generatedReply = aiSuggestedReply;
      if ((!generatedSummary || !generatedReply) && process.env.BUILT_IN_FORGE_API_KEY?.trim()) {
        try {
          const response = await invokeLLM({ messages: [{ role: "system", content: "Summarize this inbound partnership email and draft a concise, human-review-only reply for EdgeSpark Estate. Do not invent facts, prices, commitments, people, or meeting times. Return JSON with summary and reply." }, { role: "user", content: String(text || bodyText).slice(0, 12000) }], maxTokens: 500 });
          const content = response.choices[0]?.message?.content;
          if (typeof content === "string") {
            const parsed = JSON.parse(content) as { summary?: string; reply?: string };
            generatedSummary ||= parsed.summary;
            generatedReply ||= parsed.reply;
          }
        } catch { /* Reply ingestion remains available when AI is unavailable. */ }
      }
      generatedSummary ||= "A partner reply was received. Review the sender's request, timeline, decision process, and proposed next step before responding.";
      generatedReply ||= "Thank you for getting back to EdgePark Estate. We appreciate the response and would be glad to understand your priorities, the right contact for this conversation, and a suitable next step. We will review the details and follow up with a focused proposal for your consideration.";
      const message = await recordInternationalInbound({ placeId, fromEmail, toEmail, subject, bodyText: text || bodyText, providerMessageId: messageId, aiSummary: generatedSummary, aiSuggestedReply: generatedReply });
      res.status(201).json({ success: true, messageId: message.id });
    } catch (error) {
      res.status(422).json({ error: error instanceof Error ? error.message : "Inbound message could not be stored" });
    }
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
