-- 修复 handle_new_todo 触发器：当 auth.uid() 为 null（如 service_role 调用）时保留显式设置的 user_id
create or replace function public.handle_new_todo()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;
