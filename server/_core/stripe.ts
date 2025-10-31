import Stripe from "stripe";
import type { Stripe as StripeType } from "stripe";
import { ENV } from "./env";

let stripeInstance: Stripe | null = null;

/**
 * Get or create Stripe instance
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(ENV.stripeSecretKey);
  }
  return stripeInstance;
}

/**
 * Create a payment intent for minute pack purchase
 */
export async function createPaymentIntent(
  amount: number,
  packType: "5" | "15" | "30",
  clientId: number,
  clientEmail: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();

  const packNames = {
    "5": "5 minutes",
    "15": "15 minutes",
    "30": "30 minutes",
  };

  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: "eur",
    description: `Achat de ${packNames[packType]} - Client ID: ${clientId}`,
    metadata: {
      clientId: clientId.toString(),
      packType,
      clientEmail,
    },
    receipt_email: clientEmail,
  });
}

/**
 * Retrieve payment intent
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create a refund
 */
export async function createRefund(
  chargeId: string,
  amount?: number
): Promise<Stripe.Refund> {
  const stripe = getStripe();

  return await stripe.refunds.create({
    charge: chargeId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });
}

/**
 * Get charge details
 */
export async function getCharge(chargeId: string): Promise<Stripe.Charge> {
  const stripe = getStripe();
  return await stripe.charges.retrieve(chargeId);
}

/**
 * List charges for a customer
 */
export async function listCharges(
  limit: number = 10,
  metadata?: Record<string, string>
): Promise<Stripe.ApiList<Stripe.Charge>> {
  const stripe = getStripe();

  return await stripe.charges.list({
    limit,
    ...(metadata && { metadata }),
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
