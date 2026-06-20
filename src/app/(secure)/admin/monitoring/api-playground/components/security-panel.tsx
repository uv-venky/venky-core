'use client';

import { Check, Shield, ShieldCheck, User, X } from 'lucide-react';
import { startCase } from 'lodash-es';
import { cn } from '@/lib/utils';
import type { DataSource } from '../types';

const accessTypes: Array<'query' | 'insert' | 'update' | 'delete' | 'export' | 'audit'> = [
  'query',
  'insert',
  'update',
  'delete',
  'export',
  'audit',
];
const VENKY_ROLES = ['root'];

interface SecurityPanelProps {
  selectedDS: DataSource;
  roleCode: string | null;
  setRole: (role: string | null) => void;
  userName: string;
  roles: string[];
}

export function SecurityPanel({ selectedDS, roleCode, setRole, userName, roles }: SecurityPanelProps) {
  const filteredRoles = roles.filter((r) => !VENKY_ROLES.includes(r));

  return (
    <div className="flex flex-col gap-4">
      {/* Security Access Card */}
      <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Security Access</h3>
              <p className="text-muted-foreground text-xs">
                {roleCode ? (
                  <>
                    Role: <span className="font-medium text-foreground">{roleCode}</span>
                  </>
                ) : (
                  <>
                    User: <span className="font-medium text-foreground">{userName}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Access Grid */}
        <div className="grid grid-cols-2 gap-2 p-4">
          {accessTypes.map((accessType) => {
            const hasAccess = selectedDS.access?.some(
              (a) => a[accessType] && (roleCode === a.roleCode || roleCode === null),
            );
            return (
              <div
                key={accessType}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-3 py-2 transition-all',
                  hasAccess
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/5',
                )}
              >
                <span className="font-medium text-xs">{startCase(accessType)}</span>
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full',
                    hasAccess ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
                  )}
                >
                  {hasAccess ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User & Roles Card */}
      <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
            <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Identity Context</h3>
            <p className="text-muted-foreground text-xs">Switch between user and roles</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-4">
          {/* User Badge */}
          <div>
            <span className="mb-2 block font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Current User
            </span>
            <button
              type="button"
              onClick={() => setRole(null)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 transition-all',
                roleCode === null
                  ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/20 dark:border-cyan-400 dark:bg-cyan-500/10'
                  : 'border-border hover:border-cyan-300 hover:bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  roleCode === null ? 'bg-cyan-500 text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-sm">{userName}</span>
              {roleCode === null && <Check className="ml-auto h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
            </button>
          </div>

          {/* Roles */}
          {filteredRoles.length > 0 && (
            <div>
              <div className="mb-2">
                <span className="block font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Available Roles
                </span>
                <span className="text-[10px] text-muted-foreground/70">Click a role to check its access</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-xs transition-all',
                      r === roleCode
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm shadow-violet-500/25'
                        : 'border bg-background text-foreground hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10',
                    )}
                  >
                    <Shield className="h-3 w-3" />
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
