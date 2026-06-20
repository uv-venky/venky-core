import ThemeSettingsPage from '@/components/core/theme/theme-settings-page';

export function SidebarRight() {
  return (
    <div className="sticky top-0 flex h-svh w-96 flex-col border-l shadow-2xl">
      <ThemeSettingsPage />
    </div>
  );
}
