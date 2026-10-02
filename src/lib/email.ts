import { formatINR } from "./utils";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] to=${to} subject="${subject}"`);
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Elite Weavers <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error("email failed", e);
    return { ok: false };
  }
}

const shell = (body: string) => `
<div style="background:#FAF7F2;padding:32px;font-family:Georgia,serif;color:#1C1512">
  <div style="max-width:560px;margin:auto;background:#fff;border:1px solid #e9dfd0;border-radius:16px;padding:32px">
    <h1 style="letter-spacing:0.12em;font-weight:400;text-align:center;margin:0 0 4px">Elite Weavers</h1>
    <p style="text-align:center;font-size:11px;letter-spacing:0.3em;color:#C9A24B;margin:0 0 24px">HANDLOOM · COUTURE</p>
    ${body}
  </div>
</div>`;

export function orderEmail(order: { number: string; name: string; total: number }, items: { name: string; quantity: number; price: number }[]) {
  const rows = items
    .map((i) => `<tr><td style="padding:6px 0">${i.name} × ${i.quantity}</td><td align="right">${formatINR(i.price * i.quantity)}</td></tr>`)
    .join("");
  return shell(`
    <p>Namaste ${order.name},</p>
    <p>Thank you — your order <b>${order.number}</b> is confirmed. Our atelier is preparing your drape with care.</p>
    <table width="100%" style="border-top:1px solid #e9dfd0;border-bottom:1px solid #e9dfd0;margin:16px 0">${rows}
    <tr><td style="padding-top:8px"><b>Total</b></td><td align="right"><b>${formatINR(order.total)}</b></td></tr></table>
    <p style="font-size:13px;color:#6b5d54">Track your order any time at your Elite Weavers account.</p>`);
}

export function welcomeEmail() {
  return shell(`
    <p>Welcome to Elite Weavers.</p>
    <p>Here is a little something for your first saree — use code <b style="color:#6B1E2A">ELITE10</b> at checkout for 10% off.</p>`);
}
