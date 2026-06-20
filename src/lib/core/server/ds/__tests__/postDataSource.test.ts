/* Copyright (c) 2024-present Venky Corp. */

import { describe, expect, it as test } from 'vitest';
import { postDataSource } from '../postDataSource';
import { TestDS, type TestDataSourceType } from './sample-ds';
import { TEST_SESSION } from '@/lib/core/common/types/UserSession';
import type { PgPoolClient } from '@/lib/core/server/db';

describe('postDataSource', () => {
  const mockClient = {} as PgPoolClient;

  test('throws when rows is empty array', async () => {
    await expect(postDataSource(mockClient, TEST_SESSION, TestDS, [])).rejects.toThrow(
      'No rows to post for data source',
    );
  });

  test('throws when rows is null', async () => {
    await expect(
      postDataSource(
        mockClient,
        TEST_SESSION,
        TestDS,
        null as unknown as Parameters<typeof postDataSource<TestDataSourceType>>[3],
      ),
    ).rejects.toThrow('No rows to post for data source');
  });

  test('throws when rows is undefined', async () => {
    await expect(
      postDataSource(
        mockClient,
        TEST_SESSION,
        TestDS,
        undefined as unknown as Parameters<typeof postDataSource<TestDataSourceType>>[3],
      ),
    ).rejects.toThrow('No rows to post for data source');
  });
});
