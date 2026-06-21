'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
export function NotificationsForm() {
  const updatesId = useId();
  const securityId = useId();
  const marketingId = useId();
  const mentionsId = useId();
  const commentsId = useId();
  const assignmentsId = useId();
  const frequencyId = useId();
  const quietHoursId = useId();
  return _jsxs(_Fragment, {
    children: [
      _jsxs(CardHeader, {
        children: [
          _jsx(CardTitle, { children: 'Notification Preferences' }),
          _jsx(CardDescription, { children: 'Manage how and when you receive notifications.' }),
        ],
      }),
      _jsxs(CardContent, {
        className:
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto',
        children: [
          _jsxs('div', {
            className: 'space-y-4',
            children: [
              _jsx('h3', { className: 'font-medium text-lg', children: 'Email Notifications' }),
              _jsxs('div', {
                className: 'space-y-4',
                children: [
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: updatesId, children: 'Product Updates' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: 'Receive emails about new features and improvements',
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: updatesId, defaultChecked: true }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: securityId, children: 'Security Alerts' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: 'Get notified about security incidents and unusual activity',
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: securityId, defaultChecked: true }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: marketingId, children: 'Marketing' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: 'Receive promotional emails and special offers',
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: marketingId }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'space-y-4',
            children: [
              _jsx('h3', { className: 'font-medium text-lg', children: 'In-App Notifications' }),
              _jsxs('div', {
                className: 'space-y-4',
                children: [
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: mentionsId, children: 'Mentions' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: 'When someone mentions you in comments or tasks',
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: mentionsId, defaultChecked: true }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: commentsId, children: 'Comments' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: 'When someone comments on your work',
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: commentsId, defaultChecked: true }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      _jsxs('div', {
                        className: 'space-y-0.5',
                        children: [
                          _jsx(Label, { htmlFor: assignmentsId, children: 'Assignments' }),
                          _jsx('p', {
                            className: 'text-muted-foreground text-sm',
                            children: `When you're assigned to a task or project`,
                          }),
                        ],
                      }),
                      _jsx(Switch, { id: assignmentsId, defaultChecked: true }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'space-y-4',
            children: [
              _jsx('h3', { className: 'font-medium text-lg', children: 'Notification Delivery' }),
              _jsxs('div', {
                className: 'grid gap-5 sm:grid-cols-2',
                children: [
                  _jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      _jsx(Label, { htmlFor: frequencyId, children: 'Email Frequency' }),
                      _jsxs(Select, {
                        defaultValue: 'immediate',
                        children: [
                          _jsx(SelectTrigger, {
                            id: frequencyId,
                            children: _jsx(SelectValue, { placeholder: 'Select frequency' }),
                          }),
                          _jsxs(SelectContent, {
                            children: [
                              _jsx(SelectItem, { value: 'immediate', children: 'Immediate' }),
                              _jsx(SelectItem, { value: 'hourly', children: 'Hourly Digest' }),
                              _jsx(SelectItem, { value: 'daily', children: 'Daily Digest' }),
                              _jsx(SelectItem, { value: 'weekly', children: 'Weekly Digest' }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      _jsx(Label, { htmlFor: quietHoursId, children: 'Quiet Hours' }),
                      _jsxs(Select, {
                        defaultValue: 'none',
                        children: [
                          _jsx(SelectTrigger, {
                            id: quietHoursId,
                            children: _jsx(SelectValue, { placeholder: 'Select quiet hours' }),
                          }),
                          _jsxs(SelectContent, {
                            children: [
                              _jsx(SelectItem, { value: 'none', children: 'None' }),
                              _jsx(SelectItem, { value: 'evening', children: 'Evening (10PM - 7AM)' }),
                              _jsx(SelectItem, { value: 'custom', children: 'Custom' }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
//# sourceMappingURL=notifications-form.js.map
