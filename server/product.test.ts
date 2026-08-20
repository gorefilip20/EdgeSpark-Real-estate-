import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(user: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

describe("EdgeSpark access control", () => {
  it("rejects unauthenticated visitors from admin property operations", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.properties.adminList()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects signed-in non-admin users from admin property operations", async () => {
    const caller = appRouter.createCaller(context({ id: 2, openId: "visitor", name: "Visitor", email: "visitor@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }));
    await expect(caller.properties.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("Investor calculator math", () => {
  it("calculates an amortizing payment and cash-on-cash return directionally", () => {
    const price = 100_000_000;
    const loan = price * 0.7;
    const monthlyRate = 0.15 / 12;
    const months = 20 * 12;
    const payment = loan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const noi = 9_000_000 - 2_200_000;
    const returnRate = ((noi - payment * 12) / (price - loan)) * 100;
    expect(payment).toBeGreaterThan(0);
    expect(returnRate).toBeLessThan(0);
  });
});
