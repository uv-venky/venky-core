import { type IconPaths } from '../../../components/core/common/useClipboardWithAnimation';
/** Paths for morphing clipboard → checkmark (shared with chat message copy). */
export declare const CLIPBOARD_MORPH_ICON_PATHS: IconPaths;
export default function CopyToClipboard(props: {
    text: string | (() => Promise<string>);
    tip?: string;
    class?: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=CopyToClipboard.d.ts.map