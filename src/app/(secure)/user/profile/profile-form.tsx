'use client';

import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useClientSessionSnapshot, userSessionState } from '@/components/core/hooks';
import { TextInput } from '@/components/core/page';
import AvatarUploadDialog from '@/components/core/avatar-upload-dialog';
import { useMutation } from '@/lib/core/client/useQuery';

export function ProfileForm() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const session = useClientSessionSnapshot();
  const [avatar, setAvatar] = useState(session.image);
  const [newAvatar, setNewAvatar] = useState(false);
  const updateAvatar = useMutation('updateAvatar');
  const handleSaveAvatar = async (img: string) => {
    setAvatar(img);
    await updateAvatar(img);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your profile information and how others see you on the platform.</CardDescription>
      </CardHeader>
      <CardContent className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 flex-1 space-y-6 overflow-auto">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatar} alt="Profile picture" />
              <AvatarFallback>{session.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -right-2 -bottom-2 rounded-full bg-primary p-0 text-primary-foreground shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNewAvatar(false);
                  setDialogOpen(true);
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Profile Picture</h3>
            <p className="text-muted-foreground text-sm">Upload a new profile picture. Recommended size: 256x256px.</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setNewAvatar(true);
                  setDialogOpen(true);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={async () => {
                  setAvatar(undefined);
                  await updateAvatar(undefined);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput label="Display Name" value={session.name} disabled labelOnTop />
          <TextInput
            label="Job Title"
            placeholder="Job Title"
            value={session.settings.jobTitle ?? ''}
            onValueChange={(value) => {
              userSessionState.session.settings.jobTitle = value;
            }}
            labelOnTop
          />
          <TextInput
            label="Email"
            value={session.email}
            disabled
            labelOnTop
            helpText="Contact IT support to change your email address."
          />
          <TextInput
            label="Phone Number"
            placeholder="Phone Number"
            value={session.settings.phoneNumber ?? ''}
            onValueChange={(value) => {
              userSessionState.session.settings.phoneNumber = value;
            }}
            labelOnTop
            helpText={<span style={{ visibility: 'hidden' }}>Contact IT support to change your email address.</span>}
          />
          <TextInput
            label="Department"
            placeholder="Department"
            value={session.settings.department ?? ''}
            onValueChange={(value) => {
              userSessionState.session.settings.department = value;
            }}
            labelOnTop
          />
          <TextInput
            label="Bio"
            placeholder="Write a short bio about yourself"
            value={session.settings.bio ?? ''}
            onValueChange={(value) => {
              userSessionState.session.settings.bio = value;
            }}
            labelOnTop
            multiline
            className="col-span-2 min-h-[100px]"
          />
        </div>
      </CardContent>
      {dialogOpen && (
        <AvatarUploadDialog
          open
          onOpenChange={setDialogOpen}
          onSave={handleSaveAvatar}
          initialImage={newAvatar ? null : avatar}
        />
      )}
    </>
  );
}
