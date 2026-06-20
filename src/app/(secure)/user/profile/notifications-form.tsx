'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function NotificationsForm() {
  const updatesId = useId();
  const securityId = useId();
  const marketingId = useId();
  const mentionsId = useId();
  const commentsId = useId();
  const assignmentsId = useId();
  const frequencyId = useId();
  const quietHoursId = useId();
  return (
    <>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how and when you receive notifications.</CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={updatesId}>Product Updates</Label>
                <p className="text-muted-foreground text-sm">Receive emails about new features and improvements</p>
              </div>
              <Switch id={updatesId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={securityId}>Security Alerts</Label>
                <p className="text-muted-foreground text-sm">
                  Get notified about security incidents and unusual activity
                </p>
              </div>
              <Switch id={securityId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={marketingId}>Marketing</Label>
                <p className="text-muted-foreground text-sm">Receive promotional emails and special offers</p>
              </div>
              <Switch id={marketingId} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">In-App Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={mentionsId}>Mentions</Label>
                <p className="text-muted-foreground text-sm">When someone mentions you in comments or tasks</p>
              </div>
              <Switch id={mentionsId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={commentsId}>Comments</Label>
                <p className="text-muted-foreground text-sm">When someone comments on your work</p>
              </div>
              <Switch id={commentsId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={assignmentsId}>Assignments</Label>
                <p className="text-muted-foreground text-sm">{`When you're assigned to a task or project`}</p>
              </div>
              <Switch id={assignmentsId} defaultChecked />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Notification Delivery</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={frequencyId}>Email Frequency</Label>
              <Select defaultValue="immediate">
                <SelectTrigger id={frequencyId}>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={quietHoursId}>Quiet Hours</Label>
              <Select defaultValue="none">
                <SelectTrigger id={quietHoursId}>
                  <SelectValue placeholder="Select quiet hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="evening">Evening (10PM - 7AM)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}
