// src/components/ui/multi-step-form.tsx
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStepIndex: number;
  onComplete: () => void;
  onStepChange: (step: number) => void;
  isStepComplete?: (step: string) => Promise<boolean>;
  showStepIndicator?: boolean;
}

export function MultiStepForm({
  steps,
  currentStepIndex,
  onComplete,
  onStepChange,
  isStepComplete,
  showStepIndicator = true,
}: MultiStepFormProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Mark all previous steps as completed when currentStepIndex changes
  useEffect(() => {
    setCompletedSteps((prev) => {
      const newlyCompleted = steps.slice(0, currentStepIndex).map((step) => step.id);
      const merged = Array.from(new Set([...prev, ...newlyCompleted]));
      return merged;
    });
  }, [currentStepIndex, steps]);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = async () => {
    if (isStepComplete && !(await isStepComplete(currentStep.id))) {
      return;
    }

    if (isLastStep) {
      onComplete();
      return;
    }

    setCompletedSteps([...completedSteps, currentStep.id]);
    onStepChange(currentStepIndex + 1);
  };

  const goToPreviousStep = () => {
    if (isFirstStep) return;
    onStepChange(currentStepIndex - 1);
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      {showStepIndicator && (
        <div className="relative mb-8 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="absolute h-full rounded-full bg-linear-to-r from-black to-neutral-800 transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Progress Steps */}
      {showStepIndicator && (
        <div className="flex overflow-hidden rounded-xl border border-neutral-200 bg-background shadow-lg dark:border-neutral-800 dark:bg-black">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = completedSteps.includes(step.id);
            const isUpcoming = index > currentStepIndex;
            const canNavigate = index <= currentStepIndex || isCompleted;

            return (
              <div
                role="button"
                key={step.id}
                onClick={() => {
                  if (canNavigate) onStepChange(index);
                }}
                className={cn(
                  'relative flex-1 p-4 text-center transition-colors duration-300',
                  'group',
                  index !== 0 && 'border-neutral-200 border-l dark:border-neutral-800',
                  canNavigate
                    ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    : 'cursor-not-allowed opacity-50',
                  isActive && 'bg-linear-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-black',
                )}
                title={canNavigate ? 'Go to this step' : 'Complete previous steps first'}
              >
                <div className="flex items-center justify-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                      isActive && 'bg-primary text-primary-foreground ring-4 ring-neutral-200 dark:ring-neutral-800',
                      isCompleted && 'bg-background text-primary',
                      isUpcoming && 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                      !isActive &&
                        !isCompleted &&
                        !isUpcoming &&
                        'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'font-medium text-sm transition-colors duration-300',
                      isActive && 'font-bold',
                      isUpcoming && 'text-muted-foreground',
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Step Content */}
      <Card className="overflow-hidden rounded-xl border-none bg-background py-0 shadow-xl dark:bg-black">
        <CardContent className="p-8">
          <div className="relative">{currentStep.component}</div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className={cn(
            'border-2 px-6 hover:bg-neutral-50 dark:hover:bg-neutral-900',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={goToNextStep}
          className={cn('bg-black px-6 text-white hover:bg-neutral-900', 'transition-all duration-300 ease-out')}
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
