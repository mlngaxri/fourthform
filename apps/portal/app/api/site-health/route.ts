import { admin } from "../../../lib/server";
import { readProbe, signBody } from "../../../lib/services/probes";
import { validateContent } from "../../../lib/site/service";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const probe = readProbe(req.headers.get("x-fourthform-probe") || "");
  if (!probe) return new Response(null, { status: 401 });
  try {
    const service = admin();
    const { data: d, error } = await service
      .from("site_documents")
      .select("*")
      .eq("project_id", probe.projectId)
      .single();
    if (
      error ||
      !d ||
      d.revision !== probe.revision
    )
      throw new Error();
    const { data, error: storageError } = await service.rpc(
      "probe_site_services",
      { pid: probe.projectId },
    );
    if (storageError || !data) throw new Error();
    const body = JSON.stringify({
      projectId: probe.projectId,
      revision: probe.revision,
      nonce: probe.nonce,
      storage: data.forms === true && data.analytics === true,
      forms: data.forms === true,
      analytics: data.analytics === true,
      seo: validateContent(d.manifest, d.content).length === 0,
    });
    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "x-fourthform-signature": signBody(body),
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
