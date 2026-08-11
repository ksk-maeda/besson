import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getCollection } from 'astro:content';

export const prerender = false;

interface CartItemInput {
  slug: string;
  qty: number;
}

export const POST: APIRoute = async ({ request }) => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe未設定です。STRIPE_SECRET_KEYをVercelの環境変数に設定してください。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { items?: CartItemInput[]; email?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'リクエストの形式が不正です。' }), { status: 400 });
  }

  const items = body.items ?? [];
  if (items.length === 0) {
    return new Response(JSON.stringify({ error: 'カートが空です。' }), { status: 400 });
  }

  // 価格はクライアントから受け取らず、必ずサーバー側の商品データから再計算する（改ざん防止）
  const products = await getCollection('products');
  let amountYen = 0;
  const lineItems: { model: string; qty: number; unitPrice: number }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.slug);
    if (!product) {
      return new Response(JSON.stringify({ error: `不明な商品: ${item.slug}` }), { status: 400 });
    }
    const qty = Math.max(1, Math.min(10, Math.floor(item.qty)));
    const unitPrice = Number(product.data.price.replace(/[^0-9]/g, ''));
    if (!unitPrice) {
      return new Response(JSON.stringify({ error: `価格未設定の商品: ${item.slug}` }), { status: 400 });
    }
    amountYen += unitPrice * qty;
    lineItems.push({ model: product.data.model, qty, unitPrice });
  }

  const stripe = new Stripe(secretKey);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountYen, // JPYはゼロ小数通貨（100円=100、円未満の単位なし）
    currency: 'jpy',
    receipt_email: body.email || undefined,
    metadata: {
      items: JSON.stringify(lineItems),
    },
    automatic_payment_methods: { enabled: true },
  });

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret, amount: amountYen }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
