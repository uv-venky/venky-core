import { type RefObject } from 'react';
declare function useEventListener<K extends keyof WindowEventMap>(element: Window, eventName: K, handler: (event: WindowEventMap[K]) => void, options?: AddEventListenerOptions): void;
declare function useEventListener<K extends keyof DocumentEventMap>(element: Document, eventName: K, handler: (event: DocumentEventMap[K]) => void, options?: AddEventListenerOptions): void;
declare function useEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, handler: (event: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions): void;
declare function useEventListener<K extends keyof HTMLElementEventMap>(element: RefObject<HTMLElement | null>, eventName: K, handler: (event: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions): void;
export default useEventListener;
//# sourceMappingURL=useEventListener.d.ts.map