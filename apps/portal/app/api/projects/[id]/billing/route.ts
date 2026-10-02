import { ownedProject, failure } from "../../../../../lib/server";
import { stripe } from "../../../../../lib/stripe";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { client } = await ownedProject(id);
    const [payments, subscriptions] = await Promise.all([
      client
        .from("payments")
        .select("id,kind,amount,currency,paid_at")
        .eq("project_id", id)
        .order("paid_at", { ascending: false }),
      client
        .from("subscriptions")
        .select("id,status,event_created")
        .eq("project_id", id)
        .order("event_created", { ascending: false }),
    ]);
    if (payments.error) throw payments.error;
    if (subscriptions.error) throw subscriptions.error;
    let subscriptionNotice = "";
    const details = await Promise.all((subscriptions.data || []).map(async saved => {
      if (!process.env.STRIPE_SECRET_KEY) { subscriptionNotice = "Provider billing details are unavailable. Your confirmed account records are shown below."; return saved; }
      try {
        const current = await stripe().subscriptions.retrieve(saved.id);
        if (current.metadata.projectId !== id) throw new Error("Unverified subscription");
        const periods = current.items.data.map(item => item.current_period_end).filter(Boolean);
        return { ...saved, status: current.status, periodEnd: periods.length ? Math.max(...periods) : null, cancelAtPeriodEnd: current.cancel_at_period_end };
      } catch { subscriptionNotice = "Current renewal details could not be loaded. Retry billing or open the provider’s billing page."; return saved; }
    }));
    return Response.json({
      payments: payments.data || [],
      subscriptions: details,
      subscriptionNotice,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) {
    return failure(e);
  }
}
