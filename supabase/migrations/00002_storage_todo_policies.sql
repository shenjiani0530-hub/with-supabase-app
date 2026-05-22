-- 创建 todo 存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('todo', 'todo', true)
on conflict (id) do update set public = true;

-- 已登录用户可上传文件到自己的目录
create policy "用户可上传自己的文件"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'todo'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 已登录用户可查看自己的文件
create policy "用户可查看自己的文件"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'todo'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 已登录用户可删除自己的文件
create policy "用户可删除自己的文件"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'todo'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
