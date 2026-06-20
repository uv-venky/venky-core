#Requires -Version 5.1
# Print env-var assignments for the currently-running venky-rs Fargate task.
# Outputs:
#   VENKY_RS_URL=http://<task-public-ip>:8787
#   VENKY_RS_TOKEN=<value from Secrets Manager>
#
# Usage:
#   .\scripts\venky-rs-ip.ps1              # just print (paste into .env)
#   .\scripts\venky-rs-ip.ps1 -SetEnv      # set in current PowerShell session
#
# The task's public IP changes on every replacement (deploy, crash, scaling),
# so re-run after a redeploy.
#
# Optional env overrides:
#   VENKY_RS_CLUSTER       ECS cluster name      (default: cc-dev-rs-cluster)
#   VENKY_RS_SERVICE       ECS service name      (default: cc-dev-rs-service)
#   VENKY_RS_PORT          service port          (default: 8787)
#   VENKY_RS_TOKEN_SECRET  Secrets Manager id    (default: venky-rs/dev/auth-token)
#   AWS_PROFILE            AWS profile to use    (default: whatever's set in env)

param(
    [switch]$SetEnv
)

$ErrorActionPreference = 'Stop'

$Cluster = if ($env:VENKY_RS_CLUSTER) { $env:VENKY_RS_CLUSTER } else { 'cc-dev-rs-cluster' }
$Service = if ($env:VENKY_RS_SERVICE) { $env:VENKY_RS_SERVICE } else { 'cc-dev-rs-service' }
$Port = if ($env:VENKY_RS_PORT) { $env:VENKY_RS_PORT } else { '8787' }
$TokenSecret = if ($env:VENKY_RS_TOKEN_SECRET) { $env:VENKY_RS_TOKEN_SECRET } else { 'venky-rs/dev/auth-token' }

function Exit-WithError {
    param([string]$Message)
    Write-Error $Message
    exit 1
}

function Resolve-AwsCli {
    if ($env:VENKY_RS_AWS_CLI -and (Test-Path -LiteralPath $env:VENKY_RS_AWS_CLI)) {
        return $env:VENKY_RS_AWS_CLI
    }

    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $candidates = @(
        "${env:ProgramFiles}\Amazon\AWSCLIV2\aws.exe",
        "${env:ProgramFiles(x86)}\Amazon\AWSCLIV2\aws.exe"
    )
    foreach ($path in $candidates) {
        if ($path -and (Test-Path -LiteralPath $path)) {
            return $path
        }
    }

    Exit-WithError "aws CLI not found. Install AWS CLI v2 or set VENKY_RS_AWS_CLI to aws.exe"
}

$AwsCli = Resolve-AwsCli

$TaskArn = & $AwsCli ecs list-tasks --cluster $Cluster --service-name $Service `
    --desired-status RUNNING --query 'taskArns[0]' --output text 2>$null

if ([string]::IsNullOrWhiteSpace($TaskArn) -or $TaskArn -eq 'None') {
    Exit-WithError "no running task in $Cluster/$Service"
}

$Eni = & $AwsCli ecs describe-tasks --cluster $Cluster --tasks $TaskArn `
    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value | [0]' `
    --output text 2>$null

if ([string]::IsNullOrWhiteSpace($Eni) -or $Eni -eq 'None') {
    Exit-WithError "task $TaskArn has no ENI attached yet"
}

$Pub = & $AwsCli ec2 describe-network-interfaces --network-interface-ids $Eni `
    --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>$null

if ([string]::IsNullOrWhiteSpace($Pub) -or $Pub -eq 'None') {
    Exit-WithError "task ENI $Eni has no public IP (is assignPublicIp=ENABLED on the service?)"
}

$Token = & $AwsCli secretsmanager get-secret-value --secret-id $TokenSecret `
    --query SecretString --output text 2>$null

if ([string]::IsNullOrWhiteSpace($Token)) {
    Exit-WithError "couldn't fetch token from Secrets Manager id=$TokenSecret"
}

$Url = "http://${Pub}:${Port}"

if ($SetEnv) {
    $env:VENKY_RS_URL = $Url
    $env:VENKY_RS_TOKEN = $Token
    Write-Host "VENKY_RS_URL=$Url"
    Write-Host "VENKY_RS_TOKEN=$Token"
} else {
    Write-Output "VENKY_RS_URL=$Url"
    Write-Output "VENKY_RS_TOKEN=$Token"
}
