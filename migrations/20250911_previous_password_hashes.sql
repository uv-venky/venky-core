UPDATE uv_users
  SET previous_password_hashes = '[]'::jsonb
  WHERE jsonb_typeof(previous_password_hashes) != 'array';

ALTER TABLE uv_users
  ADD CONSTRAINT previous_password_hashes_array_chk
  CHECK (jsonb_typeof(previous_password_hashes) = 'array');
