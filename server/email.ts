import nodemailer from "nodemailer";

const escapeHtml = (value: string) => value.replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character] || character));
const asText = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function buildEdgeParkEmail(input: { recipientName?: string; companyName: string; subject: string; greeting: string; body: string; callToAction: string; proposalAngle?: string; }) {
  const company = escapeHtml(input.companyName);
  const greeting = escapeHtml(input.greeting);
  const body = escapeHtml(input.body).replace(/\n/g, "<br />");
  const callToAction = escapeHtml(input.callToAction);
  const proposal = input.proposalAngle ? `<div style="margin:24px 0;padding:18px;background:#f3eee6;border-left:4px solid #bd7b4b"><strong>Partnership idea</strong><p style="margin:8px 0 0;line-height:1.6">${escapeHtml(input.proposalAngle)}</p></div>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f1f0ea;font-family:Arial,Helvetica,sans-serif;color:#173b46"><div style="max-width:640px;margin:0 auto;padding:28px 16px"><div style="background:#173b46;padding:22px 28px;color:#fff"><div style="font-size:22px;font-weight:700">EdgePark</div><div style="font-size:10px;letter-spacing:3px;color:#e2a16c;margin-top:4px">ESTATE CAPITAL</div></div><div style="background:#fff;padding:32px 28px"><p style="font-size:16px">${greeting}</p><p style="line-height:1.7;white-space:normal">${body}</p>${proposal}<p style="line-height:1.7">${callToAction}</p><p style="line-height:1.7">Kind regards,<br /><strong>EdgePark Estate</strong><br />Nigeria</p></div><div style="padding:18px 28px;font-size:11px;color:#6c7776;text-align:center">This message was prepared for ${company}. Please verify all business details and partnership terms before proceeding.</div></div></body></html>`;
}

export async function sendEdgeParkEmail(input: { to: string; companyName: string; subject: string; greeting: string; body: string; callToAction: string; proposalAngle?: string; }) {
  const to = asText(input.to);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Enter a valid recipient email address.");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = asText(process.env.SMTP_USER);
  const pass = asText(process.env.SMTP_PASS);
  const from = asText(process.env.EMAIL_FROM) || user;
  if (!user || !pass || !from) throw new Error("Email is not configured. Add SMTP_USER, SMTP_PASS, and EMAIL_FROM in Hostinger.");
  const transporter = nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465, auth: { user, pass } });
  await transporter.sendMail({ from, to, subject: input.subject, text: `${input.greeting}\n\n${input.body}\n\n${input.callToAction}\n\nKind regards,\nEdgePark Estate`, html: buildEdgeParkEmail(input) });
  return { success: true, to };
}
