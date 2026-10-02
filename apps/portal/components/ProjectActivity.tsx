"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/client";
export default function ProjectActivity({ projectId }: { projectId: string }) {
  const [activity, setActivity] = useState<{ events: { type: string; created_at: string }[]; unread: number } | null>(null), [error, setError] = useState(""), [attempt, setAttempt] = useState(0);
  useEffect(() => { let active = true; setError(""); api(`/api/projects/${projectId}/activity`).then(value => { if(active) setActivity(value); }).catch(error => { if(active) setError(error.message); }); return () => { active = false; }; }, [projectId, attempt]);
  return <div className="connected-card"><h2>Recent account activity</h2>{error ? <p role="alert">{error} <button onClick={() => setAttempt(n => n+1)}>Retry activity</button></p> : !activity ? <p role="status">Loading recent activity…</p> : <><p><Link href={`/projects/${projectId}/inbox`}>{activity.unread} unread website {activity.unread===1?"enquiry":"enquiries"} ↗</Link></p>{activity.events.length ? <ul className="connected-checks">{activity.events.map((event, i) => <li key={i}><span>{event.type.replaceAll("_", " ")}</span><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></li>)}</ul> : <p>No recorded account activity yet.</p>}</>}</div>;
}
