-- Enforce append-only semantics on the DS audit table (uv_audit).

CREATE OR REPLACE FUNCTION venky_block_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only (audit table). Operation % is blocked.',
    TG_TABLE_NAME, TG_OP
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS uv_audit_immutable ON uv_audit;
CREATE TRIGGER uv_audit_immutable
  BEFORE UPDATE OR DELETE ON uv_audit
  FOR EACH ROW EXECUTE FUNCTION venky_block_audit_mutation();
