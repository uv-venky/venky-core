/* Copyright (c) 2024-present Venky Corp. */
export class PubSubClass {
  map = new Map();
  set = new Set();
  count = new Map();
  data = new Map();
  destroy = () => {
    this.map.clear();
    this.set.clear();
    this.count.clear();
    this.data.clear();
  };
  pub = async (event, props, deferrable = false, deferrableOnce = false) => {
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
  sub = (event, listener, deferrable = false, deferrableOnce = false) => {
    const eventArray = Array.isArray(event) ? event : [event];
    eventArray.forEach((e) => {
      // console.log('sub event', event, { deferrable, deferrableOnce });
      let listeners = this.map.get(e);
      if (!listeners) {
        listeners = [];
        this.map.set(e, listeners);
      }
      listeners.push(listener);
      if (deferrable || deferrableOnce) {
        const val = this.data.get(e);
        if (val) {
          // defer to avoid calling the listener immediately
          setTimeout(() => {
            listener(e, val);
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
export const globalPubSub = new PubSubClass();
//# sourceMappingURL=pub-sub.js.map
