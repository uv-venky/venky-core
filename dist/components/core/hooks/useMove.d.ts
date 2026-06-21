export declare const hasPropTillRoot: (target: HTMLElement, attr: keyof HTMLElement) => boolean;
export declare function clickOnEnterOrSpace(event: React.KeyboardEvent<HTMLElement>, onClick: (e: React.SyntheticEvent<HTMLElement, any>) => void): void;
type Fn = (props: {
    cancel?: () => void;
    moving: boolean;
    offset: {
        x: number;
        y: number;
    };
    origin: {
        clientX: number;
        clientY: number;
    };
    shiftKey: boolean;
    status: 'start' | 'moving' | 'end';
    target: EventTarget;
}) => void;
export default function useMove(name: string, fn: Fn): {
    onMouseDown: (event: React.MouseEvent<HTMLElement | SVGElement> | React.TouchEvent<HTMLElement | SVGElement>) => void;
    onTouchStart: (event: React.MouseEvent<HTMLElement | SVGElement> | React.TouchEvent<HTMLElement | SVGElement>) => void;
};
export {};
//# sourceMappingURL=useMove.d.ts.map