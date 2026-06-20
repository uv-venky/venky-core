'use client';

import type React from 'react';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Theme } from 'emoji-picker-react';
import useTheme from '@/components/core/hooks/useTheme';
import { lazy } from 'react';
const EmojiPicker = lazy(() => import('emoji-picker-react'));

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
  size?: 'sm' | 'default';
}

export function CustomEmojiPicker({ onEmojiSelect, trigger, size = 'default' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button
      size={size}
      variant="ghost"
      className={`${size === 'sm' ? 'h-7 px-2' : 'h-7 px-2'} text-muted-foreground hover:text-foreground`}
    >
      <Smile className="mr-1 h-3 w-3" />
      {size !== 'sm' && <span className="text-xs">React</span>}
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={true}
          theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
          height={400}
          width={350}
          previewConfig={{
            showPreview: false,
          }}
          skinTonesDisabled
          searchDisabled={false}
        />
      </PopoverContent>
    </Popover>
  );
}
