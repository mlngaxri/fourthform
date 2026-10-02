export const connectedPortal = process.env.NEXT_PUBLIC_CONNECTED_PORTAL === "true";
export function startHref(options:{reference?:string;package?:"first"}={}) {
 const params=new URLSearchParams();if(options.reference)params.set("reference",options.reference);if(options.package)params.set("package",options.package);
 return (connectedPortal?"/start":"/preview/start")+(params.size?`?${params}`:"");
}

export const startLabel = connectedPortal ? "Start a site" : "Try a website brief";
export const clientSignInHref = `${process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || "https://fourthform-client-portal.vercel.app"}/start?mode=signin&next=/app`;
