import {redirect} from "next/navigation";
import projects from "../../lib/portfolio/selection.json";
export default async function Start({searchParams}:{searchParams:Promise<{reference?:string;package?:string}>}) {
 const query=await searchParams;const target=new URL("/start",process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL||"https://fourthform-client-portal.vercel.app");
 target.searchParams.set("new","1");
 if(query.reference&&projects.some(p=>p.id===query.reference))target.searchParams.set("reference",query.reference);
 if(query.package==="first")target.searchParams.set("package","first");
 redirect(target.toString());
}
