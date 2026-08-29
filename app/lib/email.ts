export function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type TicketEmailParams = {
  ticketId: string;
  submittedAtIst: string;
  customerName: string;
  customerEmail: string;
  mobile: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  orderId?: string;
  assignedOfficerName?: string;
  officerId?: string;
  officerEmail?: string;
  assignmentStatus: string;
  uploadedFileLinks?: string[];
};

export function buildTicketEmailHtml(params: TicketEmailParams): string {
  const safeTicketId = escapeHtml(params.ticketId);
  const safeCustomerName = escapeHtml(params.customerName);
  const safeCustomerEmail = escapeHtml(params.customerEmail);
  const safeMobile = escapeHtml(params.mobile || "N/A");
  const safeCategory = escapeHtml(params.category);
  const safePriority = escapeHtml(params.priority || "Normal");
  const safeSubject = escapeHtml(params.subject);
  const safeDescription = escapeHtml(params.description).replace(/\n/g, "<br/>");
  const safeOrderId = escapeHtml(params.orderId || "N/A");
  const safeOfficerName = escapeHtml(params.assignedOfficerName || "None");
  const safeOfficerId = escapeHtml(params.officerId || "N/A");
  const safeOfficerEmail = escapeHtml(params.officerEmail || "N/A");
  const safeAssignmentStatus = escapeHtml(params.assignmentStatus);
  const safeSubmittedAt = escapeHtml(params.submittedAtIst);

  const fileLinksHtml = params.uploadedFileLinks && params.uploadedFileLinks.length > 0
    ? params.uploadedFileLinks.map((link) => `<a href="${escapeHtml(link)}" target="_blank" style="color: #38bdf8;">${escapeHtml(link)}</a>`).join("<br/>")
    : "None";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New VPANSAK Support Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05101d; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #05101d; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #08182b; border: 1px solid #1e3a61; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a1f38, #0f2c52); padding: 24px 30px; border-bottom: 1px solid #1e3a61;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">VPANSAK</span>
                    <span style="font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 0.15em; display: block; margin-top: 2px;">OFFICIAL SUPPORT HUB</span>
                  </td>
                  <td align="right">
                    <span style="background-color: #1766ef; color: #ffffff; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 20px; display: inline-block;">
                      ${safeTicketId}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #ffffff;">New Support Ticket Created</h2>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                A new customer support ticket has been registered in the system. Complete details are below.
              </p>

              <!-- Ticket Info Card -->
              <table role="presentation" width="100%" style="background-color: #0f2540; border: 1px solid #1e406d; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; width: 140px;"><strong>Subject:</strong></td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 700;">${safeSubject}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;"><strong>Category:</strong></td>
                  <td style="padding: 6px 0; color: #38bdf8; font-weight: 700;">${safeCategory}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;"><strong>Priority:</strong></td>
                  <td style="padding: 6px 0; color: #facc15; font-weight: 700;">${safePriority}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;"><strong>Submitted At (IST):</strong></td>
                  <td style="padding: 6px 0; color: #cbd5e1;">${safeSubmittedAt}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;"><strong>Order ID:</strong></td>
                  <td style="padding: 6px 0; color: #cbd5e1;">${safeOrderId}</td>
                </tr>
              </table>

              <!-- Customer Details -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #38bdf8; border-bottom: 1px solid #1e3a61; padding-bottom: 6px;">Customer Information</h3>
              <table role="presentation" width="100%" style="margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8; width: 140px;">Customer Name:</td>
                  <td style="padding: 4px 0; color: #ffffff;"><strong>${safeCustomerName}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8;">Email Address:</td>
                  <td style="padding: 4px 0; color: #ffffff;"><a href="mailto:${safeCustomerEmail}" style="color: #38bdf8; text-decoration: none;">${safeCustomerEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8;">Mobile Number:</td>
                  <td style="padding: 4px 0; color: #ffffff;">${safeMobile}</td>
                </tr>
              </table>

              <!-- Assignment Info -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #38bdf8; border-bottom: 1px solid #1e3a61; padding-bottom: 6px;">Assignment Information</h3>
              <table role="presentation" width="100%" style="margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8; width: 140px;">Assignment Status:</td>
                  <td style="padding: 4px 0; color: #ffffff;"><strong>${safeAssignmentStatus}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8;">Assigned Officer:</td>
                  <td style="padding: 4px 0; color: #ffffff;">${safeOfficerName} (${safeOfficerId})</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8;">Officer Email:</td>
                  <td style="padding: 4px 0; color: #ffffff;">${safeOfficerEmail}</td>
                </tr>
              </table>

              <!-- Description -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #38bdf8; border-bottom: 1px solid #1e3a61; padding-bottom: 6px;">Description / Message</h3>
              <div style="background-color: #030b14; border: 1px solid #1e3a61; border-radius: 8px; padding: 16px; color: #e2e8f0; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                ${safeDescription}
              </div>

              <!-- Attachments / File Links -->
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #38bdf8; border-bottom: 1px solid #1e3a61; padding-bottom: 6px;">Uploaded File Links</h3>
              <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 24px;">
                ${fileLinksHtml}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #040d18; padding: 20px 30px; text-align: center; border-top: 1px solid #1e3a61; font-size: 11px; color: #64748b;">
              VPANSAK Support Hub &bull; Automated System Notification<br/>
              This email was generated automatically. Please do not reply directly to this message.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
};

export async function sendEmailViaResend(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.warn("Resend API key missing (RESEND_API_KEY env not configured). Skipping email dispatch.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  const fromEmail = process.env.SUPPORT_FROM_EMAIL || "VPANSAK Support <support@vpansak.com>";

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    };

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.id) {
      return { success: true, id: data.id };
    }

    const errorMsg = data?.message || data?.name || `HTTP ${res.status}`;
    console.error(`Resend email delivery failed to ${options.to}:`, errorMsg);
    return { success: false, error: errorMsg };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Resend request error for ${options.to}:`, message);
    return { success: false, error: message || "Network request failed" };
  }
}
