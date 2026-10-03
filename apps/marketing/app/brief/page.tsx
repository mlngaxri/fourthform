import type {Metadata} from "next";
import WebsiteBrief from "../../components/marketing/WebsiteBrief";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Your website brief",description:"Write, save and download a brief for your custom business website."};
export default function Page(){return <WebsiteBrief canSend={Boolean(process.env.RESEND_API_KEY&&process.env.CONTACT_TO&&process.env.EMAIL_FROM)}/>;}
