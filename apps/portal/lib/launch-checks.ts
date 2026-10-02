export const launchCheckKinds = ["domain", "deployment", "forms", "analytics", "seo"] as const;
export type LaunchCheckKind = typeof launchCheckKinds[number];
export type LaunchDiagnostic = { kind: LaunchCheckKind; status: "pass" | "fail" | "blocked"; detail: string };
const failures: Record<LaunchCheckKind, string> = {
  domain: "Save the address connected to this website, then run the checks again.",
  deployment: "Hosting could not confirm the saved website version. Wait for deployment, then run the checks again.",
  forms: "Enquiry storage could not be verified. Fourthform needs to check the inbox connection.",
  analytics: "Traffic storage could not be verified. Fourthform needs to check the reporting connection.",
  seo: "Review the saved content and search details in Pages and Search, then check again.",
};
const confirmations: Record<LaunchCheckKind, string> = {
  domain: "The saved address returned an authenticated website response.",
  deployment: "Hosting confirmed the exact saved website version.",
  forms: "A temporary enquiry was written, read and removed successfully.",
  analytics: "A temporary traffic event was written, read and removed successfully.",
  seo: "The saved content and search metadata passed validation.",
};
export function launchDiagnostics(probe: Record<string, unknown>): LaunchDiagnostic[] {
  return launchCheckKinds.map(kind => {
    const pass = kind === "domain" || kind === "deployment" || probe[kind] === true;
    return { kind, status: pass ? "pass" : "fail", detail: pass ? confirmations[kind] : failures[kind] };
  });
}
export function blockedLaunchDiagnostics(failed: LaunchCheckKind): LaunchDiagnostic[] {
  return launchCheckKinds.map(kind => ({ kind, status: kind === failed ? "fail" : "blocked", detail: kind === failed ? failures[kind] : "Waiting for the failed check to be resolved." }));
}
