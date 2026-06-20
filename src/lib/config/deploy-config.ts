/* Copyright (c) 2024-present Venky Corp. */

import type { DeployConfigMap } from '@/lib/core/common/types/DeployConfig';

export const AWS_REGION = 'us-east-1';

export const GITHUB_REPO_NAME = 'uv-venky/demo';

export const deployConfig: DeployConfigMap = {
  DEV: {
    clusterName: 'venky-work-cluster',
    serviceName: 'venky-work-service',
    label: 'Development',
  },
};
