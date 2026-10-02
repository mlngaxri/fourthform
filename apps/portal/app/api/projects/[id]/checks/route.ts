import {
  ownedProject,
  admin,
  checkOrigin,
  failure,
} from "../../../../../lib/server";
import { checkDeployment } from "../../../../../lib/services/domains";
import { appOrigin, siteUrl } from "../../../../../lib/site/builtin";
import { rateLimit } from "../../../../../lib/security/abuse";
import { launchDiagnostics, blockedLaunchDiagnostics, type LaunchCheckKind } from "../../../../../lib/launch-checks";
export const maxDuration = 60;
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { client } = await ownedProject(id);
    const { data, error } = await client
      .from("integration_receipts")
      .select("kind,evidence,verified_at")
      .eq("project_id", id);
    if (error) throw error;
    const { data: document, error: documentError } = await client.from("site_documents").select("revision").eq("project_id", id).maybeSingle();
    if (documentError) throw documentError;
    return Response.json({ checks: data || [], revision: String(document?.revision || "") });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let checking = false;
  let stage: LaunchCheckKind = "deployment";
  try {
    checkOrigin(req);
    const { id } = await params;
    const { client, user, project } = await ownedProject(id);
    await rateLimit("launch-check", user.id, 5);
    if (project.phase !== "LAUNCH")
      throw new Error(
        "Approval and payment are required before checking launch.",
      );
    const { data: d, error: documentError } = await client
      .from("site_documents")
      .select("revision")
      .eq("project_id", id)
      .single();
    if (documentError) throw documentError;
    if (!d) throw new Error("Your website has not been set up.");
    const service = admin();
    checking = true;
    // A failed recheck cannot leave an older success available for launch.
    const { error: clearError } = await service.from("integration_receipts").delete().eq("project_id", id);
    if (clearError) throw clearError;
    const release = await service.rpc("prepare_site_release", {
      pid: id,
      expected: d.revision,
    });
    if (release.error) throw release.error;
    const url = await siteUrl(id),
      origin = new URL(url).origin,
      domain = new URL(url).hostname;
    stage = "domain";
    if (project.launch.domain !== domain)
      throw new Error(
        "The saved launch domain does not match the connected website.",
      );
    stage = "deployment";
    const probe = await checkDeployment(
      id,
      d.revision,
      origin === new URL(appOrigin()).origin ? appOrigin() : origin,
    );
    const diagnostics = launchDiagnostics(probe);
    if (diagnostics.some(check => check.status !== "pass")) {
      return Response.json({ error: "Launch checks need attention. Resolve the checks shown below, then try again.", checks: [], diagnostics }, { status: 503 });
    }
    const receipts = ["domain", "analytics", "forms", "seo", "deployment"].map(
      (kind) => ({
        project_id: id,
        kind,
        evidence: {
          revision: String(d.revision),
          domain,
          url,
          storage: probe.storage,
          result: diagnostics.find(check => check.kind === kind),
          versionId: release.data.id,
          delivery: kind === "forms" ? "portal inbox" : undefined,
        },
        verified_at: new Date().toISOString(),
      }),
    );
    const { error } = await service
      .from("integration_receipts")
      .upsert(receipts, { onConflict: "project_id,kind" });
    if (error) throw error;
    return Response.json({ checks: receipts, diagnostics, revision: String(d.revision) });
  } catch (e) {
    if (checking) return Response.json({ error: "Launch checks could not complete. Resolve the check shown below, then try again.", checks: [], diagnostics: blockedLaunchDiagnostics(stage) }, { status: 503 });
    return failure(e);
  }
}
