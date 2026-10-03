import type {Metadata} from "next";
import Pricing from "../../components/marketing/Pricing";
export const metadata:Metadata={title:"Website pricing",description:"Custom websites for A$1,500, with up to five pages, three revision rounds and your client portal included.",alternates:{canonical:"/pricing"}};
export default function Page(){return <Pricing/>;}
