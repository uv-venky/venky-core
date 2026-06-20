'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HardHat, Mail, Clock, ArrowRight, Hammer, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageShell from './core/page/page-shell';
import { useManualReadySignal } from '@/lib/core/client/loading-tracker';

export default function UnderConstruction() {
  const manualReadySignal = useManualReadySignal();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    manualReadySignal();
  }, [manualReadySignal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    // console.log('Email submitted:', email);
    setSubmitted(true);
    setEmail('');
  };

  // Estimated completion date - adjust as needed
  const launchDate = new Date('2025-06-01T12:00:00Z');

  return (
    <PageShell title="Under Construction">
      <div className="flex h-full flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-background shadow-lg">
                <HardHat className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-bold text-4xl tracking-tight">Under Construction</h1>
            <p className="text-muted-foreground">
              {`We're working hard to bring you something amazing. This page is currently being built and will be ready
            soon.`}
            </p>
          </div>

          <div className="flex justify-center space-x-6 py-6">
            <div className="flex flex-col items-center">
              <Hammer className="mb-2 h-6 w-6 text-primary" />
              <span className="text-muted-foreground text-sm">Building</span>
            </div>
            <div className="flex flex-col items-center">
              <Wrench className="mb-2 h-6 w-6 text-primary" />
              <span className="text-muted-foreground text-sm">Refining</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="mb-2 h-6 w-6 text-primary" />
              <span className="text-muted-foreground text-sm">Coming Soon</span>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Get notified when we launch</h3>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
                <Button type="submit" className="w-full">
                  Notify Me
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="rounded-md bg-primary/10 p-3 text-center text-sm">
                {`Thanks! We'll notify you when we launch.`}
              </div>
            )}
          </div>

          <div className="text-muted-foreground text-sm">
            <p>Expected launch: {launchDate.toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
