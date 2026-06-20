# Delegates to the Node rebrand script (excludes node_modules for speed).
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
node (Join-Path $scriptDir "venky-rebrand.mjs")
