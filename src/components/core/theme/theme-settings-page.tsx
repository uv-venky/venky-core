'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import TailwindColorPicker from '@/components/core/theme/tailwind-color-picker';

// Define the color categories and their variables
const colorCategories = {
  base: [
    { name: 'Background', variable: '--background' },
    { name: 'Foreground', variable: '--foreground' },
  ],
  component: [
    { name: 'Card', variable: '--card' },
    { name: 'Card Foreground', variable: '--card-foreground' },
    { name: 'Popover', variable: '--popover' },
    { name: 'Popover Foreground', variable: '--popover-foreground' },
    { name: 'Primary', variable: '--primary' },
    { name: 'Primary Hover', variable: '--primary-hover' },
    { name: 'Primary Foreground', variable: '--primary-foreground' },
    { name: 'Secondary', variable: '--secondary' },
    { name: 'Secondary Foreground', variable: '--secondary-foreground' },
  ],
  state: [
    { name: 'Muted', variable: '--muted' },
    { name: 'Muted Foreground', variable: '--muted-foreground' },
    { name: 'Accent', variable: '--accent' },
    { name: 'Accent Foreground', variable: '--accent-foreground' },
    { name: 'Destructive', variable: '--destructive' },
    { name: 'Destructive Foreground', variable: '--destructive-foreground' },
  ],
  ui: [
    { name: 'Table Header', variable: '--table-header' },
    { name: 'Table Header Foreground', variable: '--table-header-foreground' },
    { name: 'Border', variable: '--border' },
    { name: 'Input', variable: '--input' },
    { name: 'Ring', variable: '--ring' },
  ],
  chart: [
    { name: 'Chart 1', variable: '--chart-1' },
    { name: 'Chart 2', variable: '--chart-2' },
    { name: 'Chart 3', variable: '--chart-3' },
    { name: 'Chart 4', variable: '--chart-4' },
    { name: 'Chart 5', variable: '--chart-5' },
  ],
  sidebar: [
    { name: 'Sidebar', variable: '--sidebar' },
    { name: 'Sidebar Foreground', variable: '--sidebar-foreground' },
    { name: 'Sidebar Primary', variable: '--sidebar-primary' },
    {
      name: 'Sidebar Primary Foreground',
      variable: '--sidebar-primary-foreground',
    },
    { name: 'Sidebar Accent', variable: '--sidebar-accent' },
    {
      name: 'Sidebar Accent Foreground',
      variable: '--sidebar-accent-foreground',
    },
    { name: 'Sidebar Border', variable: '--sidebar-border' },
    { name: 'Sidebar Ring', variable: '--sidebar-ring' },
  ],
};

// Define other theme variables
const otherVariables = {
  radius: [{ name: 'Border Radius', variable: '--radius' }],
};

export default function ThemeSettingsPage() {
  const [themeValues, setThemeValues] = useState({
    light: {} as Record<string, string>,
    dark: {} as Record<string, string>,
  });
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');

  // Initialize theme values from CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const lightValues: Record<string, string> = {};
    const darkValues: Record<string, string> = {};

    // Create a temporary dark mode element to get dark mode values
    const tempDarkElement = document.createElement('div');
    tempDarkElement.classList.add('dark');
    document.body.appendChild(tempDarkElement);

    // Get all variables
    const allVariables = [...Object.values(colorCategories).flat(), ...Object.values(otherVariables).flat()];

    // Get light mode values
    allVariables.forEach(({ variable }) => {
      lightValues[variable] = getComputedStyle(root).getPropertyValue(variable).trim();
    });

    // Get dark mode values
    allVariables.forEach(({ variable }) => {
      const style = getComputedStyle(tempDarkElement);
      darkValues[variable] = style.getPropertyValue(variable).trim();
    });

    // Remove temporary element
    document.body.removeChild(tempDarkElement);

    setThemeValues({ light: lightValues, dark: darkValues });
  }, []);

  // Handle color input change
  const handleColorChange = useCallback(
    (variable: string, value: string) => {
      setThemeValues((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab as 'light' | 'dark'],
          [variable]: value,
        },
      }));
    },
    [activeTab],
  );

  // Save theme (in a real app, this would save to localStorage or a database)
  // const saveTheme = () => {
  //   // Apply light theme variables to :root
  //   Object.entries(themeValues.light).forEach(([variable, value]) => {
  //     document.documentElement.style.setProperty(variable, value);
  //   });

  //   // Create or update the dark theme CSS
  //   let styleElement = document.getElementById('dark-theme-styles');
  //   if (!styleElement) {
  //     styleElement = document.createElement('style');
  //     styleElement.id = 'dark-theme-styles';
  //     document.head.appendChild(styleElement);
  //   }

  //   // Generate dark theme CSS
  //   const darkThemeCSS = `.dark {
  //     ${Object.entries(themeValues.dark)
  //       .map(([variable, value]) => `${variable}: ${value};`)
  //       .join('\n  ')}
  //   }`;

  //   styleElement.textContent = darkThemeCSS;

  //   // Show success message
  //   showSuccess('Theme saved successfully!');
  // };

  return (
    // <PageLayout
    //   title="Theme Customization"
    //   subTitle="Customize your application's theme by modifying CSS variables for both light and dark modes."
    //   toolbar={
    //     <>
    //       <div className="flex items-center space-x-2">
    //         <Switch id="preview-mode" checked={previewMode} onCheckedChange={togglePreviewMode} />
    //         <Label htmlFor="preview-mode" className="cursor-pointer">
    //           <div className="flex items-center gap-1">
    //             <Eye className="h-4 w-4" />
    //             <span>Preview</span>
    //           </div>
    //         </Label>
    //       </div>

    //       <Button variant="outline" onClick={resetTheme} className="flex items-center gap-1">
    //         <RefreshCw className="h-4 w-4" />
    //         Reset to Default
    //       </Button>
    //       <Button onClick={saveTheme} className="flex items-center gap-1">
    //         <Save className="h-4 w-4" />
    //         Save Theme
    //       </Button>
    //     </>
    //   }
    // >
    <div className="flex h-full overflow-hidden p-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'light' | 'dark')}
        className="flex h-full flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mb-6 grid w-full shrink-0 grid-cols-2">
          <TabsTrigger value="light" className="flex items-center gap-1">
            <Sun className="h-4 w-4" />
            Light Mode
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex items-center gap-1">
            <Moon className="h-4 w-4" />
            Dark Mode
          </TabsTrigger>
        </TabsList>

        {['light', 'dark'].map((mode) => (
          <TabsContent
            key={mode}
            value={mode}
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto"
          >
            <Accordion type="multiple" defaultValue={['base']}>
              {/* Base Colors */}
              <AccordionItem value="base">
                <AccordionTrigger>Base Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.base.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Component Colors */}
              <AccordionItem value="component">
                <AccordionTrigger>Component Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.component.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* State Colors */}
              <AccordionItem value="state">
                <AccordionTrigger>State Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.state.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* UI Element Colors */}
              <AccordionItem value="ui">
                <AccordionTrigger>UI Element Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.ui.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Chart Colors */}
              <AccordionItem value="chart">
                <AccordionTrigger>Chart Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.chart.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Sidebar Colors */}
              <AccordionItem value="sidebar">
                <AccordionTrigger>Sidebar Colors</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {colorCategories.sidebar.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Other Variables */}
              <AccordionItem value="other">
                <AccordionTrigger>Other Variables</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {otherVariables.radius.map((item) => (
                      <ColorInput
                        key={item.variable}
                        variable={item.variable}
                        name={item.name}
                        mode={activeTab}
                        value={themeValues[activeTab][item.variable]}
                        handleColorChange={handleColorChange}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    // </PageLayout>
  );
}

function ColorInput({
  variable,
  name,
  mode,
  value,
  handleColorChange,
}: {
  variable: string;
  name: string;
  mode: 'light' | 'dark';
  value: string;
  handleColorChange: (variable: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <div>
        <Label htmlFor={`${mode}-${variable}`} className="font-medium text-sm">
          {name}
        </Label>
        <div className="text-muted-foreground text-xs">{variable}</div>
      </div>
      <div className="w-40">
        <TailwindColorPicker
          value={value}
          onChange={(newValue) => handleColorChange(variable, newValue)}
          cssVariable={variable}
        />
      </div>
    </div>
  );
}
