/* Copyright (c) 2024-present Venky Corp. */

/**
 * SSE Pub/Sub Framework Types
 *
 * Channel-based Server-Sent Events for real-time notifications
 * from server to browser clients.
 */

/**
 * Event type identifier for SSE events in the VENKY_events notification channel
 */
export type SSEEventType = 'sse';

/**
 * Channel pattern types for type-safe channel subscriptions
 *
 * Examples:
 * - `workflow:abc123` - workflow-specific events
 * - `execution:xyz789` - execution-specific events
 * - `notification:user123` - user notifications
 * - `data:users` - data change events for a table
 * - `_system` - internal system messages (connection status, etc.)
 * - `job:status` - scheduled/manual job run events (admin Job Command Center)
 */

/** Workflow channel pattern: `workflow:${string}` */
export type WorkflowChannel = `workflow:${string}`;

/** Execution channel pattern: `execution:${string}` */
export type ExecutionChannel = `execution:${string}`;

/** Notification channel pattern: `notification:${string}` */
export type NotificationChannel = `notification:${string}`;

/** Data channel pattern: `data:${string}` */
export type DataChannel = `data:${string}`;

/** Comment channel pattern: `comment:${string}:${string}` */
export type CommentChannel = `comment:${string}:${string}`;

/** Custom app channel pattern: `custom:${string}` — apps define their own sub-patterns */
export type CustomChannel = `custom:${string}`;

/** System channel pattern: `_system` */
export type SystemChannel = '_system';

/** Job status channel (admin job dashboard) */
export type JobStatusChannel = 'job:status';

/** Union of all channel pattern types */
export type Channel =
  | WorkflowChannel
  | ExecutionChannel
  | NotificationChannel
  | DataChannel
  | CommentChannel
  | CustomChannel
  | SystemChannel
  | JobStatusChannel;

/**
 * Payload types for each channel pattern
 */
export interface WorkflowChannelPayload {
  type: 'new_execution' | 'update';
  executionId: string;
  status: string;
}

export interface ExecutionChannelPayload {
  type: 'update';
  status: 'started' | 'running' | 'success' | 'error' | 'paused';
}

export interface NotificationChannelPayload {
  title: string;
  body: string;
}

export interface DataChannelPayload {
  action: string;
  id: string;
  /** Browser tab trackId to prevent self-refresh on the originating tab */
  sourceTrackId?: string;
}

export type CommentChannelPayload =
  | {
      type: 'comment_created';
      comment: import('@/types/comments').Comment;
    }
  | {
      type: 'reaction_updated';
      commentId: string;
      reactions: Record<string, string>;
    }
  | {
      type: 'view_updated';
      viewer: string;
      viewedAt: string;
    };

/** Payload for custom app channels — apps define their own shape */
export type CustomChannelPayload = Record<string, any>;

export interface JobStatusChannelPayload {
  type: 'job_update';
  jobName: string;
  event: 'started' | 'completed' | 'failed';
  runId: number;
}

export type SystemChannelPayload =
  | {
      type: 'connected' | 'disconnected';
      channels?: string[];
    }
  | {
      type: 'version';
      version: string;
    };

/**
 * Maps channel prefixes to their corresponding payload types
 */
type ChannelPayloadMap = {
  workflow: WorkflowChannelPayload;
  execution: ExecutionChannelPayload;
  notification: NotificationChannelPayload;
  data: DataChannelPayload;
  comment: CommentChannelPayload;
  custom: CustomChannelPayload;
  job: JobStatusChannelPayload;
  _system: SystemChannelPayload;
};

/**
 * Extracts the channel prefix from a channel pattern
 */
type ExtractChannelPrefix<T extends Channel> = T extends `workflow:${string}`
  ? 'workflow'
  : T extends `execution:${string}`
    ? 'execution'
    : T extends `notification:${string}`
      ? 'notification'
      : T extends `data:${string}`
        ? 'data'
        : T extends `comment:${string}:${string}`
          ? 'comment'
          : T extends `custom:${string}`
            ? 'custom'
            : T extends 'job:status'
              ? 'job'
              : T extends '_system'
                ? '_system'
                : never;

/**
 * Maps channel patterns to their corresponding payload types
 */
export type ChannelPayload<T extends Channel> = ChannelPayloadMap[ExtractChannelPrefix<T>];

/**
 * SSE message structure used for both PostgreSQL NOTIFY payloads
 * and messages sent from server to client
 *
 * @template T - The channel pattern type. When omitted, uses Channel for runtime usage.
 */
export interface SSEMessage<T extends Channel = Channel> {
  /** The channel this message was published to */
  channel: T;
  /** The event data payload */
  data: ChannelPayload<T>;
  /** Unix timestamp when the message was created */
  timestamp: number;
}

/**
 * Runtime SSE message type for use when the channel pattern is not known at compile time
 */
export type SSEMessageRuntime = SSEMessage<Channel>;

/**
 * Connection status for SSE clients
 */
export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

/**
 * Options for the useSSE hook
 */
export interface UseSSEOptions<T extends Channel> {
  /** Channels to subscribe to */
  channels: T[];
  /** Callback when a message is received */
  onMessage: (channel: T, data: ChannelPayload<T>) => void;
  /** Whether the subscription is enabled (default: true) */
  enabled?: boolean;
  /** Callback when connection status changes */
  onStatusChange?: (status: SSEConnectionStatus) => void;
}

/**
 * Return type for the useSSE hook
 */
export interface UseSSEReturn {
  /** Current connection status */
  status: SSEConnectionStatus;
}

/**
 * Callback type for SSE message handlers
 */
export type SSEMessageCallback<T extends Channel> = (channel: T, data: ChannelPayload<T>) => void;

/**
 * SSE Client information stored in the registry
 */
export interface SSEClient {
  /** The stream controller to send data to */
  controller: ReadableStreamDefaultController<Uint8Array>;
  /** The username associated with this connection */
  userName: string;
  /** Channels this client is subscribed to */
  channels: Set<string>;
  /** Text encoder for sending messages */
  encoder: TextEncoder;
}
