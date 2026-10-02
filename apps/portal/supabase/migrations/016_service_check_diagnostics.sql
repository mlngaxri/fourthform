-- Each storage check runs independently and removes its temporary records.
-- Failures roll back their own block without hiding the other check's result.
create function public.probe_site_services(pid uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare enquiry uuid=gen_random_uuid(); traffic uuid=gen_random_uuid(); forms_ok boolean=false; analytics_ok boolean=false;
begin
 if not exists(select 1 from projects where id=pid) then raise exception 'Unknown website'; end if;
 begin
  insert into form_submissions(id,project_id,page_id,name,email,message) values(enquiry,pid,'probe','Service check','check@example.invalid','Launch storage check');
  if not exists(select 1 from form_submissions where id=enquiry and project_id=pid) then raise exception 'Storage acknowledgement failed'; end if;
  delete from form_submissions where id=enquiry;
  forms_ok=true;
 exception when others then forms_ok=false;
 end;
 begin
  insert into analytics_events(id,project_id,page_id,kind,visitor,source,device) values(traffic,pid,'probe','pageview','probe','probe','probe');
  if not exists(select 1 from analytics_events where id=traffic and project_id=pid) then raise exception 'Storage acknowledgement failed'; end if;
  delete from analytics_events where id=traffic;
  analytics_ok=true;
 exception when others then analytics_ok=false;
 end;
 return jsonb_build_object('forms',forms_ok,'analytics',analytics_ok);
end $$;
revoke all on function public.probe_site_services(uuid) from public,anon,authenticated;
grant execute on function public.probe_site_services(uuid) to service_role;
