import type { APIRoute } from 'astro';
import Stripe from 'stripe';

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
    event = await stripe.webhooks.constructEventAsync(rawBody, signature ?? '', webhookSecret);
  } catch (err) {
    return new Response(`Webhook署名検証に失敗: ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await notifySlack(pi);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

async function notifySlack(pi: Stripe.PaymentIntent) {
  const webhookUrl = import.meta.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    // 通知未設定でも決済自体は成立している（Stripeダッシュボードに記録あり）
    console.warn('SLACK_WEBHOOK_URL未設定のため注文通知をスキップ', pi.id);
    return;
  }

  let items: { model: string; qty: number; unitPrice: number }[] = [];
  try {
    items = JSON.parse(pi.metadata.items || '[]');
  } catch {
    /* 明細なしで通知する */
  }

  const itemsText =
    items.map((i) => `• ${i.model} × ${i.qty}（単価 ¥${i.unitPrice.toLocaleString()}）`).join('\n') ||
    '（明細情報なし）';

  const shipping = pi.shipping;
  const shippingText = shipping
    ? `${shipping.name ?? ''}\n${shipping.address?.line1 ?? ''}`
    : '（配送先情報なし）';

  const message = {
    text: `🍷 BESSONに新しい注文が入りました（¥${pi.amount.toLocaleString()}）`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🍷 BESSON 新規注文', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*金額*\n¥${pi.amount.toLocaleString()}` },
          { type: 'mrkdwn', text: `*お客様メール*\n${pi.receipt_email ?? '（未取得）'}` },
        ],
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*明細*\n${itemsText}` },
          { type: 'mrkdwn', text: `*配送先*\n${shippingText}` },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `次のアクション：ロジレスに受注を登録してください（手順は受注処理マニュアル参照）\n<https://dashboard.stripe.com/payments/${pi.id}|Stripeで決済の詳細を見る>`,
        },
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    console.error('Slack通知の送信に失敗', res.status, await res.text());
  }
}
