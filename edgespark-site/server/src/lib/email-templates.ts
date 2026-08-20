/**
 * EdgeSpark — Email Templates
 * HTML email template functions for transactional emails
 */

const BRAND_GOLD = "#C9A24B";
const BRAND_NAVY = "#0F1729";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
<tr><td style="background:${BRAND_NAVY};padding:24px 32px;text-align:center">
<span style="font-size:20px;font-weight:700;color:${BRAND_GOLD};letter-spacing:1px">EdgeSpark</span>
</td></tr>
<tr><td style="padding:32px">${body}</td></tr>
<tr><td style="background:#fafaf9;padding:20px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e5e4">
&copy; ${new Date().getFullYear()} Evarestus Company Ltd. All rights reserved.<br>EdgeSpark Real Estate
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:${BRAND_NAVY};border-radius:8px;padding:12px 28px">
<a href="${url}" style="color:#fff;font-weight:600;font-size:14px;text-decoration:none;display:inline-block">${text}</a>
</td></tr></table>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:20px;color:${BRAND_NAVY}">${text}</h2>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c">${text}</p>`;
}

// ---- TEMPLATES ----

export function welcomeEmail(name: string, loginUrl: string): { subject: string; html: string } {
  return {
    subject: "Welcome to EdgeSpark",
    html: layout("Welcome to EdgeSpark",
      heading("Welcome, " + name + "!") +
      para("Your EdgeSpark account is ready. Browse vetted Nigerian real estate deals backed by complete Deal Analyzers, title verification, and physical inspections.") +
      btn("Browse Properties", loginUrl) +
      para("If you have any questions, reply to this email — we read every message.")
    ),
  };
}

export function dealInterestEmail(name: string, dealTitle: string, propertyUrl: string): { subject: string; html: string } {
  return {
    subject: "Interest received — " + dealTitle,
    html: layout("Interest Received",
      heading("We received your interest") +
      para("Hi " + name + ", thank you for expressing interest in <strong>" + dealTitle + "</strong>.") +
      para("Our team will review your submission and get back to you within 1-2 business days.") +
      btn("View Property", propertyUrl) +
      para("You can check the status of your interests anytime from your dashboard.")
    ),
  };
}

export function dealApprovedEmail(name: string, dealTitle: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: "Interest approved — " + dealTitle,
    html: layout("Interest Approved",
      heading("Your interest has been approved!") +
      para("Hi " + name + ", great news — your interest in <strong>" + dealTitle + "</strong> has been approved by our team.") +
      para("Next steps: We will reach out to discuss terms and walk you through the deal analyzer.") +
      btn("View Dashboard", dashboardUrl)
    ),
  };
}

export function dealRejectedEmail(name: string, dealTitle: string, reason: string, propertiesUrl: string): { subject: string; html: string } {
  return {
    subject: "Update on your interest — " + dealTitle,
    html: layout("Interest Update",
      heading("Update on your interest") +
      para("Hi " + name + ", we reviewed your interest in <strong>" + dealTitle + "</strong>.") +
      para("Unfortunately, we are unable to proceed at this time." + (reason ? " <em>" + reason + "</em>" : "")) +
      para("There are other great opportunities available:") +
      btn("Browse Properties", propertiesUrl)
    ),
  };
}

export function passwordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset your password — EdgeSpark",
    html: layout("Password Reset",
      heading("Password Reset") +
      para("Hi " + name + ", we received a request to reset your password. Click the button below to set a new one.") +
      btn("Reset Password", resetUrl) +
      para("This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.") +
      `<p style="margin:0;font-size:12px;color:#a8a29e">If the button doesn't work, copy this URL: ${resetUrl}</p>`
    ),
  };
}

export function partnerApplicationEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Partner application received — EdgeSpark",
    html: layout("Partner Application Received",
      heading("Application received") +
      para("Hi " + name + ", thank you for applying to partner with EdgeSpark.") +
      para("We review every application carefully and will get back to you within 3-5 business days.") +
      para("In the meantime, browse our current properties and learn more about how our JV model works.")
    ),
  };
}

export function partnerApprovedEmail(name: string, dashboardUrl: string): { subject: string; html: string } {
  return {
    subject: "Welcome aboard, Partner!",
    html: layout("Partner Approved",
      heading("Welcome to the team, " + name + "!") +
      para("Your partner application has been approved. You now have access to exclusive deal flow, priority allocations, and direct contact with our acquisitions team.") +
      btn("Access Dashboard", dashboardUrl)
    ),
  };
}

export function contactConfirmEmail(name: string): { subject: string; html: string } {
  return {
    subject: "We received your message — EdgeSpark",
    html: layout("Message Received",
      heading("Message received") +
      para("Hi " + name + ", thanks for reaching out to EdgeSpark. Our team has received your inquiry and will respond within 24 hours.") +
      para("While you wait, take a look at our current investment opportunities.")
    ),
  };
}

export function propertyAlertEmail(name: string, propertyTitle: string, city: string, price: string, propertyUrl: string): { subject: string; html: string } {
  return {
    subject: "New property listed — " + propertyTitle,
    html: layout("New Property Alert",
      heading("New Property Alert") +
      para("Hi " + name + ", a new property matching your preferences has been listed:") +
      `<table cellpadding="0" cellspacing="0" style="background:#fafaf9;border-radius:8px;padding:16px;margin:0 0 16px;width:100%">
<tr><td><strong style="font-size:16px;color:${BRAND_NAVY}">${propertyTitle}</strong><br>
<span style="color:#78716c;font-size:14px">${city} · ${price}</span></td></tr></table>` +
      btn("View Property", propertyUrl)
    ),
  };
}

export function adminInterestNotification(investorName: string, investorEmail: string, dealTitle: string, adminUrl: string): { subject: string; html: string } {
  return {
    subject: "[Admin] New interest — " + dealTitle,
    html: layout("New Interest Alert",
      heading("New investor interest") +
      para("<strong>" + investorName + "</strong> (" + investorEmail + ") expressed interest in <strong>" + dealTitle + "</strong>.") +
      btn("Review in Admin", adminUrl) +
      para("Log in to the admin panel to review and respond.")
    ),
  };
}

export function adminPartnerNotification(applicantName: string, applicantEmail: string, company: string, adminUrl: string): { subject: string; html: string } {
  return {
    subject: "[Admin] New partner application — " + applicantName,
    html: layout("New Partner Application",
      heading("New partner application") +
      para("<strong>" + applicantName + "</strong> (" + applicantEmail + ")" + (company ? " from <strong>" + company + "</strong>" : "") + " submitted a partner application.") +
      btn("Review in Admin", adminUrl) +
      para("Log in to the admin panel to review the application.")
    ),
  };
}
