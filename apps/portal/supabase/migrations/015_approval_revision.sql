-- Approval pins the managed review content under the same project lock as edits.
alter function public.project_command(uuid,text,jsonb,integer,uuid) rename to project_command_before_approval;
revoke all on function public.project_command_before_approval(uuid,text,jsonb,integer,uuid) from public,anon,authenticated;
create function public.project_command(pid uuid,action text,payload jsonb,expected integer,command_key uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare revision_value integer;
begin
 if auth.uid() is null or not public.can_access(pid) then raise exception 'Project not found or access denied'; end if;
 perform 1 from projects where id=pid for update;
 if action='approve' and not exists(select 1 from commands where project_id=pid and key=command_key) then
  select revision into revision_value from site_documents where project_id=pid;
  if revision_value is not null and payload->>'siteRevision' is distinct from revision_value::text then
   raise exception 'Save conflict: the website version changed. Review the current website before approving';
  end if;
 end if;
 return public.project_command_before_approval(pid,action,payload,expected,command_key);
end $$;
revoke all on function public.project_command(uuid,text,jsonb,integer,uuid) from public,anon;
grant execute on function public.project_command(uuid,text,jsonb,integer,uuid) to authenticated;
