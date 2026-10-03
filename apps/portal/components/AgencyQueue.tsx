"use client";
import {websitePackageLabels} from "../../../shared/service-labels";
import Link from "next/link";
import { useState } from "react";
import { phaseLabels, type Project } from "../lib/model";
export default function AgencyQueue({ projects }: { projects: Project[] }) {
  const [query,setQuery]=useState(""), [owner,setOwner]=useState("all");
  const agency=(p:Project)=>["BUILDING","REVISION_IN_PROGRESS"].includes(p.phase);
  const visible=projects.filter(project=>project.name.toLowerCase().includes(query.toLowerCase())&&(owner==="all"||owner==="agency"&&agency(project)||owner==="client"&&!agency(project)&&project.phase!=="LIVE"||owner==="live"&&project.phase==="LIVE"));
  return <section aria-label="Agency project queue"><div className="connected-grid"><label>Find a client website<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Business name"/></label><label>Next action<select value={owner} onChange={e=>setOwner(e.target.value)}><option value="all">All projects</option><option value="agency">With Fourthform</option><option value="client">Needs client action</option><option value="live">Live websites</option></select></label></div><p role="status">{visible.length} {visible.length===1?"project":"projects"}</p>{visible.map(project=><Link className="project-list-item" key={project.id} href={["DRAFT_ONBOARDING","AWAITING_INITIAL_PAYMENT"].includes(project.phase)?`/start?project=${project.id}`:`/projects/${project.id}/overview`}><span><strong>{project.name}</strong><small>{agency(project)?"With Fourthform":project.phase==="LIVE"?"Live website":"Needs client action"} · {websitePackageLabels[project.package]}</small></span><span>{phaseLabels[project.phase]} ↗</span></Link>)}{!visible.length&&<p>No projects match. Change the search or show all projects.</p>}</section>;
}
