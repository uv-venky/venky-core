'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { UserAvatar } from '@/lib/common/ds/types/core/UserAvatar';
import { getColor } from '@/lib/core/client/color';
import { isEmpty } from '@/lib/core/common/isEmpty';
import { format } from 'date-fns';
import { CalendarRange, Mail, MapPin } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import tinyColor from 'tinycolor2';
import { showError } from '@/components/core/common/Notification';
import { getErrorMessage } from '@/lib/core/common/error';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function getAvatarChars(value?: string | null) {
  if (isEmpty(value)) return '...';
  const len = value.length;
  let char = '';
  let avatar = '';
  let wordStart = true;
  for (let i = 0; i < len; i++) {
    char = value.charAt(i);
    switch (char) {
      case ' ':
      case '_':
      case '-':
      case '.':
      case '@':
        wordStart = true;
        break;
      default:
        if (wordStart) {
          avatar += char.toUpperCase();
          if (avatar.length === 2) {
            return avatar;
          }
          wordStart = false;
        }
        break;
    }
  }
  return avatar;
}

interface UserProfilePopoverProps {
  user: UserAvatar;
  children: React.ReactNode;
}

export function UserProfilePopover({ user, children }: UserProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      showError(getErrorMessage(e));
      return 'N/A';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const bgcolor = getColor(user.email);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          className="pointer-events-none"
          onMouseEnter={() => {
            setIsOpen(true);
          }}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        ref={containerRef}
        className="w-80 border-0 bg-transparent p-0"
        align="start"
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Card className="w-80 overflow-hidden rounded-md border py-0 pb-6">
          <CardHeader className="bg-accent pt-6 pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                <AvatarImage src={user.picture || undefined} alt={user.displayName} />
                <AvatarFallback
                  style={{
                    backgroundColor: bgcolor,
                    color: tinyColor.mostReadable(bgcolor, ['#fff', '#000']).toHexString(),
                  }}
                  className="text-lg"
                >
                  {getAvatarChars(user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">{user.displayName}</h3>
                <span className="text-muted-foreground text-sm">@{user.userName}</span>
                {user.userId && <span className="text-muted-foreground text-xs">ID: {user.userId}</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.locationName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.locationName}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatDate(user.startDate)}
                  {user.endDate ? ` - ${formatDate(user.endDate)}` : ' - Present'}
                </span>
              </div>

              {/* <Separator className="my-2" />

                <div className="flex justify-end">
                  <a
                    href={`/users/${user.userId || user.userName}`}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    View full profile
                  </a>
                </div> */}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
