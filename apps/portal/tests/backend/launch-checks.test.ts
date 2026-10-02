import test from "node:test";
import assert from "node:assert/strict";
import { launchDiagnostics, blockedLaunchDiagnostics } from "../../lib/launch-checks";

test("launch checks fail closed for each unavailable connection without hiding the working connections", () => {
  const checks = launchDiagnostics({ forms: false, analytics: true, seo: true });
  assert.equal(checks.find(check => check.kind === "forms")?.status, "fail");
  assert.equal(checks.find(check => check.kind === "analytics")?.status, "pass");
  assert.equal(checks.find(check => check.kind === "seo")?.status, "pass");
  assert.ok(launchDiagnostics({ storage: true }).filter(check => ["forms", "analytics", "seo"].includes(check.kind)).every(check => check.status === "fail"));
  assert.ok(launchDiagnostics({ forms: "true", analytics: 1, seo: null }).filter(check => ["forms", "analytics", "seo"].includes(check.kind)).every(check => check.status === "fail"));
});

test("a failed hosting check blocks downstream checks and gives a specific next action", () => {
  const checks = blockedLaunchDiagnostics("deployment");
  assert.equal(checks.filter(check => check.status === "fail").length, 1);
  assert.ok(checks.filter(check => check.kind !== "deployment").every(check => check.status === "blocked"));
  assert.match(checks.find(check => check.kind === "deployment")!.detail, /Wait for deployment/);
});
