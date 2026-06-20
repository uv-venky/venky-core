/* Copyright (c) 2024-present Venky Corp. */

import type { StoreIdentifier } from '@/lib/core/common/types/Store';

export interface EventMap {
  [key: string]: Record<string, unknown>;
}

export interface PubSub<T = EventMap> {
  destroy(): void;
  pub<K extends keyof T>(event: K, props: T[K], deferrable?: boolean, deferrableOnce?: boolean): Promise<void>;
  sub<K extends keyof T>(
    event: K | K[],
    listener: <E extends K>(event: E, props: T[E]) => Promise<void>,
    deferrable?: boolean,
    deferrableOnce?: boolean,
  ): () => void;
}

export class PubSubClass<T = EventMap> implements PubSub<T> {
  map = new Map<keyof T, (<K extends keyof T>(event: K, props: T[K]) => Promise<void>)[]>();

  set = new Set<string>();

  count = new Map<keyof T, number>();

  data = new Map<keyof T, unknown>();

  destroy = () => {
    this.map.clear();
    this.set.clear();
    this.count.clear();
    this.data.clear();
  };

  pub = async <K extends keyof T>(event: K, props: T[K], deferrable = false, deferrableOnce = false) => {
    const listeners = this.map.get(event) ?? [];
    const len = listeners.length;
    // console.log('publishing event', event, { len, deferrable });
    let onceCalled = false;
    if (len > 0) {
      const all = [];
      for (let i = 0; i < len; i++) {
        all.push(listeners[i](event, props));
      }
      await Promise.allSettled(all);
      onceCalled = true;
    }
    if (deferrable || (deferrableOnce && !onceCalled)) {
      this.data.set(event, props);
    }
  };

  sub = <K extends keyof T>(
    event: K | K[],
    listener: <E extends K>(_event: E, props: T[E]) => Promise<void>,
    deferrable = false,
    deferrableOnce = false,
  ): (() => void) => {
    const eventArray = Array.isArray(event) ? event : [event];
    eventArray.forEach((e) => {
      // console.log('sub event', event, { deferrable, deferrableOnce });
      let listeners = this.map.get(e);
      if (!listeners) {
        listeners = [];
        this.map.set(e, listeners);
      }
      listeners.push(listener as <E extends keyof T>(event: E, props: T[E]) => Promise<void>);

      if (deferrable || deferrableOnce) {
        const val = this.data.get(e);
        if (val) {
          // defer to avoid calling the listener immediately
          setTimeout(() => {
            listener(e, val as T[K]);
          }, 1);
          // leave the event in the data map so it can be used for future subscribers
          if (deferrableOnce) {
            this.data.delete(e);
          }
        }
      }
    });

    return () => {
      eventArray.forEach((e) => {
        let _listeners = this.map.get(e);
        if (_listeners) {
          _listeners = _listeners.filter((l) => l !== listener);
          this.map.set(e, _listeners);
        }
      });
    };
  };
}

/**
 * Global event map for cross-store communication
 */
export interface GlobalEventMap {
  /** Fired when a datasource has changes (insert/update/delete) */
  OnDataSourceChange: {
    datasourceId: string;
    sourceStoreKey: string;
    action: 'insert' | 'update' | 'delete' | 'mixed';
  };
  /** Fired to invalidate/refresh stores matching the given identifiers */
  OnStoreInvalidate: {
    identifiers: StoreIdentifier[];
    sourceStoreKey?: string;
  };
}

export const globalPubSub = new PubSubClass<GlobalEventMap>();
