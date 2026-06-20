/* Copyright (c) 2023-present Venky Corp */

import { Button } from '@/components/ui/button';
import { useClipboardWithAnimation, type IconPaths } from '@/components/core/common/useClipboardWithAnimation';

/** Paths for morphing clipboard → checkmark (shared with chat message copy). */
export const CLIPBOARD_MORPH_ICON_PATHS: IconPaths = {
  default: {
    color: 'gray',
    d: 'M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zM8 21V7h11v14H8z',
  },
  success: {
    color: 'green',
    d: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
};

export default function CopyToClipboard(props: {
  text: string | (() => Promise<string>);
  tip?: string;
  class?: string;
}) {
  const { isLoading, isAnimating, pathRef, copyToClipboard } = useClipboardWithAnimation({
    paths: CLIPBOARD_MORPH_ICON_PATHS,
    successMessage: 'Copied to clipboard',
    errorMessage: 'Failed to copy to clipboard',
  });

  const handleClick = async () => {
    if (isAnimating) return;

    const text = typeof props.text === 'function' ? await props.text() : props.text;
    await copyToClipboard(text);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      data-tip={props.tip ?? 'Copy to clipboard'}
      onClick={handleClick}
      disabled={isLoading || isAnimating}
      className={props.class}
    >
      <svg width="24px" height="24px" viewBox="0 0 24 24">
        <path ref={pathRef} d={CLIPBOARD_MORPH_ICON_PATHS.default.d} fill={CLIPBOARD_MORPH_ICON_PATHS.default.color} />
      </svg>
    </Button>
  );
}
