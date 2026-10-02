import { ownedProject, failure } from "../../../../../lib/server";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params, { client } = await ownedProject(id);
    const [events, inbox] = await Promise.all([client.from("audit_events").select("type,created_at").eq("project_id", id).in("type", ["send_initial","begin_build","internal_check","deliver","submit_revision","withdraw_revision","start_revision","complete_revision","approve","launch","website_publish","website_rollback"]).order("created_at", { ascending:false }).limit(5), client.from("form_submissions").select("id", { count:"exact", head:true }).eq("project_id", id).eq("status", "new")]);
    if (events.error) throw events.error;
    if (inbox.error) throw inbox.error;
    return Response.json({ events: events.data || [], unread: inbox.count || 0 }, { headers:{"Cache-Control":"private, no-store"} });
  } catch(error) { return failure(error); }
}
