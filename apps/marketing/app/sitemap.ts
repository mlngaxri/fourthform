import type { MetadataRoute } from "next";
import {projects} from "../lib/portfolio/projects";
export default function sitemap(): MetadataRoute.Sitemap {
 return ["/", "/work", "/how-we-work", "/pricing", ...projects.map(({id})=>`/work/${id}`)].map(path=>({url:`https://fourthform-marketing.vercel.app${path}`}));
}
