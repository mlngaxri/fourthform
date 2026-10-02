import type { MetadataRoute } from "next";
import {websiteConcepts} from "../lib/portfolio/concepts";
export default function sitemap(): MetadataRoute.Sitemap {
 return ["/", "/work", ...websiteConcepts.map(({id})=>`/work/${id}`)].map(path=>({url:`https://fourthform-marketing.vercel.app${path}`}));
}
