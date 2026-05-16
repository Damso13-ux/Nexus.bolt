import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-12-18.acacia",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { plan } = await req.json();

    if (!plan || !["monthly", "annual"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: "Plan invalide" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Find an active "Nexus Premium" product, or reactivate/create one
    let product: Stripe.Product | null = null;

    const activeProducts = await stripe.products.search({
      query: 'name:"Nexus Premium" active:"true"',
    });

    if (activeProducts.data.length > 0) {
      product = activeProducts.data[0];
    } else {
      // Check if there's an inactive product we can reactivate
      const allProducts = await stripe.products.search({
        query: 'name:"Nexus Premium"',
      });

      if (allProducts.data.length > 0) {
        product = await stripe.products.update(allProducts.data[0].id, {
          active: true,
        });
      } else {
        product = await stripe.products.create({
          name: "Nexus Premium",
          description:
            "Accès illimité à tous les articles premium, newsletter hebdomadaire exclusive et analyses approfondies.",
        });
      }
    }

    // Find or create the price for the selected plan
    const interval = plan === "monthly" ? "month" : "year";
    const unitAmount = plan === "monthly" ? 600 : 4900;

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: "recurring",
    });

    let priceId: string | undefined;
    for (const p of existingPrices.data) {
      if (
        p.recurring?.interval === interval &&
        p.unit_amount === unitAmount &&
        p.currency === "eur"
      ) {
        priceId = p.id;
        break;
      }
    }

    if (!priceId) {
      const newPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: unitAmount,
        currency: "eur",
        recurring: { interval },
      });
      priceId = newPrice.id;
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, user_id: user.id },
      success_url: `${origin}/tarifs?success=true`,
      cancel_url: `${origin}/tarifs?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erreur serveur" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
