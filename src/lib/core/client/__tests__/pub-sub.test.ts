import { describe, it, expect, vi } from 'vitest';
import { PubSubClass } from '../pub-sub';

describe('PubSubClass', () => {
  it('should subscribe and publish to a single event', async () => {
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    pubsub.sub('test', listener);
    await pubsub.pub('test', { data: 'foo' });
    expect(listener).toHaveBeenCalledWith('test', { data: 'foo' });
  });

  it('should subscribe and publish to multiple events', async () => {
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    pubsub.sub(['test1', 'test2'], listener);
    await pubsub.pub('test1', { data: 'foo' });
    await pubsub.pub('test2', { data: 'bar' });
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith('test1', { data: 'foo' });
    expect(listener).toHaveBeenCalledWith('test2', { data: 'bar' });
  });

  it('should unsubscribe from a single event', async () => {
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    const unsub = pubsub.sub('test', listener);
    unsub();
    await pubsub.pub('test', { data: 'foo' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should unsubscribe from multiple events', async () => {
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    const unsub = pubsub.sub(['test1', 'test2'], listener);
    unsub();
    await pubsub.pub('test1', { data: 'foo' });
    await pubsub.pub('test2', { data: 'bar' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle deferrable events', async () => {
    vi.useFakeTimers();
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    await pubsub.pub('test', { data: 'foo' }, true);

    pubsub.sub('test', listener, true);

    vi.runAllTimers();
    expect(listener).toHaveBeenCalledWith('test', { data: 'foo' });
    vi.useRealTimers();
  });

  it('should handle deferrableOnce events', async () => {
    vi.useFakeTimers();
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    await pubsub.pub('test', { data: 'foo' }, false, true);

    // First subscriber gets it
    pubsub.sub('test', listener, false, true);
    vi.runAllTimers();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('test', { data: 'foo' });

    // Second subscriber should NOT get it because it was deleted
    const listener2 = vi.fn();
    pubsub.sub('test', listener2, false, true);

    vi.runAllTimers();
    expect(listener2).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should destroy and clear all listeners', async () => {
    const pubsub = new PubSubClass();
    const listener = vi.fn();
    pubsub.sub('test', listener);
    pubsub.destroy();
    await pubsub.pub('test', { data: 'foo' });
    expect(listener).not.toHaveBeenCalled();
  });
});
