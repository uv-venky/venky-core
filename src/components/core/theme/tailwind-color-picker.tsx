'use client';

import type React from 'react';

import { useState, useEffect, useId } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import useWhyDidYouUpdate from '@/components/core/hooks/useWhyDidYouUpdate';

// Tailwind CSS v4 colors
const tailwindColors = {
  slate: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  zinc: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  neutral: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  stone: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  red: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  orange: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  amber: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  yellow: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  lime: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  green: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  emerald: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  teal: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  cyan: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  sky: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  blue: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  indigo: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  violet: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  purple: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  fuchsia: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  pink: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  rose: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
};

// Group colors for tabs
const colorGroups = {
  Grays: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
  Reds: ['red', 'orange', 'amber', 'yellow'],
  Greens: ['lime', 'green', 'emerald', 'teal'],
  Blues: ['cyan', 'sky', 'blue', 'indigo'],
  Purples: ['violet', 'purple', 'fuchsia', 'pink', 'rose'],
};

interface TailwindColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  cssVariable: string;
  label?: string;
}

export default function TailwindColorPicker({ value, onChange, cssVariable, label }: TailwindColorPickerProps) {
  const [open, setOpen] = useState(false);
  useWhyDidYouUpdate('TailwindColorPicker', {
    open,
    setOpen,
    value,
    onChange,
    cssVariable,
    label,
  });
  const [customColor, setCustomColor] = useState('');
  const [activeTab, setActiveTab] = useState('Grays');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const customColorId = useId();

  // Initialize custom color from value
  useEffect(() => {
    if (value) {
      setCustomColor(value);
    }
  }, [value]);

  // Handle color selection
  const handleColorSelect = (color: string, shade: number) => {
    const selectedValue = `var(--color-${color}-${shade})`;
    setSelectedColor(`${color}-${shade}`);
    onChange(selectedValue);

    // Update CSS variable in global.css
    updateCssVariable(cssVariable, selectedValue);
  };

  // Handle custom color input
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
  };

  // Apply custom color
  const applyCustomColor = () => {
    if (customColor) {
      onChange(customColor);
      setSelectedColor(null);

      // Update CSS variable in global.css
      updateCssVariable(cssVariable, customColor);
    }
  };

  // Update CSS variable in global.css
  const updateCssVariable = (variable: string, newValue: string) => {
    // In a real implementation, this would update the CSS variable in global.css
    // For now, we'll update it in the document root
    document.documentElement.style.setProperty(variable, newValue);
  };

  // Copy color to clipboard
  const copyToClipboard = (colorName: string, shade: number) => {
    const colorValue = `var(--color-${colorName}-${shade})`;
    navigator.clipboard.writeText(colorValue);
    setCopiedColor(`${colorName}-${shade}`);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="relative w-full justify-between overflow-hidden"
            onClick={() => setOpen(true)}
          >
            <div className="absolute top-0 bottom-0 left-0 w-12" style={{ backgroundColor: value }} />
            <span className="truncate pl-12">{value}</span>
            <Paintbrush className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[440px] p-0" align="start">
          <div className="border-b p-4">
            <h4 className="font-medium text-sm">Tailwind CSS v4 Colors</h4>
            <p className="mt-1 text-muted-foreground text-xs">Select a color to update {cssVariable}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none border-b p-0">
                {Object.keys(colorGroups).map((group) => (
                  <TabsTrigger
                    key={group}
                    value={group}
                    className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
                  >
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {Object.entries(colorGroups).map(([group, colors]) => (
              <TabsContent key={group} value={group} className="p-4 pt-2">
                <div className="grid gap-4">
                  {colors.map((color) => (
                    <div key={color} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium text-xs capitalize">{color}</Label>
                      </div>
                      <div className="grid grid-cols-11 gap-1">
                        {tailwindColors[color as keyof typeof tailwindColors].map((shade) => (
                          <button
                            type="button"
                            key={shade}
                            className={cn(
                              'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border',
                              selectedColor === `${color}-${shade}` && 'ring-2 ring-primary ring-offset-2',
                            )}
                            style={{
                              backgroundColor: `var(--color-${color}-${shade})`,
                              borderColor: `var(--color-${color}-${shade})`,
                              borderWidth: 1,
                              borderStyle: 'solid',
                            }}
                            onClick={() => handleColorSelect(color, shade)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              copyToClipboard(color, shade);
                            }}
                            title={`${color}-${shade}`}
                          >
                            {copiedColor === `${color}-${shade}` && (
                              <Check className="h-3 w-3 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="border-t p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor={customColorId} className="text-xs">
                  Custom Color
                </Label>
                <div className="mt-1.5 flex">
                  <Input
                    id={customColorId}
                    value={customColor}
                    onChange={handleCustomColorChange}
                    placeholder="#000000 or var(--color)"
                    className="rounded-r-none"
                    onFocus={(e) => e.target.select()}
                  />
                  <Button className="rounded-l-none px-2" onClick={applyCustomColor}>
                    Apply
                  </Button>
                </div>
              </div>
              <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: customColor }} />
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Enter a hex value or CSS variable. Right-click any color to copy its variable.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
