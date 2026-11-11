import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-09-30" as Stripe.ApiVersion,
  // Add webhook signing configuration
});

// Webhook endpoint for Stripe events
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Supported event types and their handler mappings
const eventHandlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  "checkout.session.completed": async (event: Stripe.Event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Handle successful checkout - assign credits based on plan
    const planId = session.metadata?.plan_tier;
    const userId = session.metadata?.user_id;
    const credits = session.metadata?.credits_amount;
    
    if (!userId) {
      throw new Error("Missing user_id in webhook payload");
    }
    
    // Update user balance in Supabase
    // TODO: Implement Supabase balance update
    console.log(`💳 Webhook: Credits assigned for user ${userId}, plan: ${planId}, credits: ${credits}`);
  },

  "invoice.payment_succeeded": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    
    // Handle recurring payment success
    console.log(`✅ Webhook: Payment succeeded for subscription ${subscriptionId}`);
    
    // Could update subscription status, renew credits, etc.
  },

  "invoice.payment_failed": async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    
    // Handle failed payment - notify user, potentially suspend service
    console.log(`❌ Webhook: Payment failed for subscription ${subscriptionId}`);
    
    // Could trigger email notification, grace period, etc.
  },

  "customer.subscription.updated": async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Handle subscription updates (plan changes, cancellations, etc.)
    const status = subscription.status;
    const planId = subscription.items.data[0]?.price?.recurring?.metadata?.plan_tier;
    
    console.log(`🔄 Webhook: Subscription updated, status: ${status}`);
  },

  "customer.subscription.deleted": async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Handle subscription cancellation
    console.log(`📛 Webhook: Subscription deleted`);
  },
};

/**
 * POST handler for Stripe webhooks
 * Validates the webhook signature and routes to the appropriate handler
 */
export async function POST(
  request: Request
) {
  const sig = request.headers.get("stripe-signature") || "";
  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      await request.text(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Route the event to the appropriate handler
  const handler = eventHandlers[event.type];

  try {
    if (handler) {
      await handler(event);
    } else {
      // Log unhandled events for future implementation
      console.log(`📝 Unhandled event type: ${event.type}`);
    }

    // Respond successfully to Stripe
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error(`❌ Webhook handler error for ${event.type}:`, error);
    return NextResponse.json(
      { error: "Internal webhook error" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification (rarely needed, for testing)
 */
export async function GET() {
  return NextResponse.json({
    status: "webhook-endpoint-active",
    supported_events: Object.keys(eventHandlers),
    version: "0.1.0",
  });
}