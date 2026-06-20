'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { SecurityForm } from './security-form';
import { NotificationsForm } from './notifications-form';
import { PageLayout, PageShell } from '@/components/core/page';

export function UserProfilePage({
  defaultTab = 'profile',
}: {
  defaultTab?: 'profile' | 'preferences' | 'notifications' | 'security';
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <PageShell title="Profile Settings" noPadding>
      <PageLayout
        title="Profile Settings"
        subTitle="Manage your account settings and preferences."
        toolbar={
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        }
        mainSection={
          <div className="h-full flex-1 p-4">
            <Tabs defaultValue={defaultTab} className="flex h-full flex-col space-y-6">
              <TabsList className="grid w-full shrink-0 grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="flex-1 overflow-hidden">
                <Card className="flex h-full flex-1 flex-col overflow-hidden">
                  <ProfileForm />
                </Card>
              </TabsContent>
              <TabsContent value="preferences" className="flex-1 overflow-hidden">
                <Card className="flex h-full flex-1 flex-col overflow-hidden">
                  <PreferencesForm />
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="flex-1 overflow-hidden">
                <Card className="flex h-full flex-1 flex-col overflow-hidden">
                  <NotificationsForm />
                </Card>
              </TabsContent>
              <TabsContent value="security" className="flex-1 overflow-hidden">
                <Card className="flex h-full flex-1 flex-col overflow-hidden">
                  <SecurityForm />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        }
      />
    </PageShell>
  );
}
