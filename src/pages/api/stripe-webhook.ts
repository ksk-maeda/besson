import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new Response('Stripe未設定', { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? '', webhookSecret);
  } catch (err) {
    return new Response(`Webhook署名検証に失敗: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await notifyOrder(pi);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

async function notifyOrder(pi: Stripe.PaymentIntent) {
  const resendKey = import.meta.env.RESEND_API_KEY;
  const notifyTo = import.meta.env.ORDER_NOTIFY_EMAIL;
  if (!resendKey || !notifyTo) {
    // 通知設定が未整備でも決済自体は成立しているため、ここでは静かに抜ける
    // （Stripeダッシュボードには記録が残る）
    console.warn('ORDER_NOTIFY_EMAIL / RESEND_API_KEY 未設定のため注文通知メールをスキップしました', pi.id);
    return;
  }

  let items: { model: string; qty: number; unitPrice: number }[] = [];
  try {
    items = JSON.parse(pi.metadata.items || '[]');
  } catch {
    // 無視（明細なしで通知する）
  }

  const itemsText = items.map((i) => `- ${i.model} × ${i.qty}（単価 ¥${i.unitPrice.toLocaleString()}）`).join('\n');

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: 'BESSON注文通知 <orders@besson.jp>',
    to: notifyTo,
    subject: `【BESSON】新規注文 ¥${pi.amount.toLocaleString()}`,
    text: `新しい注文が入りました。\n\n金額: ¥${pi.amount.toLocaleString()}\nメール: ${pi.receipt_email ?? '(未取得)'}\nPaymentIntent: ${pi.id}\n\n明細:\n${itemsText}\n\n発送手配をお願いします（フルフィルメント方式に応じて対応）。`,
  });
}
