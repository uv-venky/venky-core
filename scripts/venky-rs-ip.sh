#!/usr/bin/env bash
# Print env-var assignments for the currently-running venky-rs Fargate task.
# Outputs:
#   export VENKY_RS_URL=http://<task-public-ip>:8787
#   export VENKY_RS_TOKEN=<value from Secrets Manager>
#
# Usage:
#   eval "$(./scripts/venky-rs-ip.sh)"      # set in current shell
#   ./scripts/venky-rs-ip.sh                # just print
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

set -euo pipefail

CLUSTER="${VENKY_RS_CLUSTER:-cc-dev-rs-cluster}"
SERVICE="${VENKY_RS_SERVICE:-cc-dev-rs-service}"
PORT="${VENKY_RS_PORT:-8787}"
TOKEN_SECRET="${VENKY_RS_TOKEN_SECRET:-venky-rs/dev/auth-token}"

TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" \
  --desired-status RUNNING --query 'taskArns[0]' --output text 2>/dev/null)

if [[ -z "$TASK_ARN" || "$TASK_ARN" == "None" ]]; then
  echo "no running task in $CLUSTER/$SERVICE" >&2
  exit 1
fi

ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value | [0]' \
  --output text 2>/dev/null)

if [[ -z "$ENI" || "$ENI" == "None" ]]; then
  echo "task $TASK_ARN has no ENI attached yet" >&2
  exit 1
fi

PUB=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI" \
  --query 'NetworkInterfaces[0].Association.PublicIp' --output text 2>/dev/null)

if [[ -z "$PUB" || "$PUB" == "None" ]]; then
  echo "task ENI $ENI has no public IP (is assignPublicIp=ENABLED on the service?)" >&2
  exit 1
fi

TOKEN=$(aws secretsmanager get-secret-value --secret-id "$TOKEN_SECRET" \
  --query SecretString --output text 2>/dev/null)

if [[ -z "$TOKEN" ]]; then
  echo "couldn't fetch token from Secrets Manager id=$TOKEN_SECRET" >&2
  exit 1
fi

echo "VENKY_RS_URL=http://${PUB}:${PORT}"
echo "VENKY_RS_TOKEN=${TOKEN}"
