# Remove out-of-scope features from venky-core
$root = Split-Path $PSScriptRoot -Parent

$removePaths = @(
  "src\components\chat",
  "src\components\agents",
  "src\components\kb-video",
  "src\components\workflow",
  "src\lib\chat",
  "src\lib\workflow",
  "src\lib\codegen-templates",
  "src\lib\server\kb-video",
  "src\app\(secure)\(cc)",
  "src\app\api\auth\sso",
  "src\app\api\auth\google",
  "src\app\api\mobile",
  "src\venky-exports\core\ai",
  "src\venky-exports\core\components\chat"
)

foreach ($p in $removePaths) {
  $full = Join-Path $root $p
  if (Test-Path $full) {
    Remove-Item $full -Recurse -Force
    Write-Host "Removed $p"
  }
}

# Keep only curated migrations
$keepMigrations = @(
  '20240419_init.sql',
  '20250524_uv_user_activity.sql',
  '20250525_add_event_id_to_uv_user_activity.sql',
  '20250525_uv_logs.sql',
  '20250527_job_scheduler.sql',
  '20250527_uv_email_requests.sql',
  '20250606_uv_roles.sql',
  '20250719_add_app_version.sql',
  '20250719_page_url2.sql',
  '20250721_ttl_store.sql',
  '20250803_sql_history.sql',
  '20250911_force_password_change.sql',
  '20250911_previous_password_hashes.sql',
  '20251117_add_app_id.sql',
  '20251118_update_job_tables_pk.sql',
  '20251122_create_apps_table.sql',
  '20251123_add_app_id_to_user_sessions.sql',
  '20251126_add_metadata_to_user_sessions.sql',
  '20251203_lookups.sql',
  '20260204_add_scheduler_id.sql',
  '20260214_scheduler_nodes.sql',
  '20260302_user_activity_archive.sql',
  '20260403_user_activity_archive_page_url.sql',
  '20260422_rate_limit_buckets.sql',
  '20260422_session_rotation.sql',
  '20260514_uv_roles.sql',
  '20260515_audit_immutability.sql'
)

$migDir = Join-Path $root "migrations"
Get-ChildItem $migDir -Filter "*.sql" | ForEach-Object {
  if ($keepMigrations -notcontains $_.Name) {
    Remove-Item $_.FullName -Force
    Write-Host "Removed migration $($_.Name)"
  }
}

Write-Host "Trim complete."
