// src/components/ui/multi-step-form.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
export function MultiStepForm({ steps, currentStepIndex, onComplete, onStepChange, isStepComplete, showStepIndicator = true, }) {
    const [completedSteps, setCompletedSteps] = useState([]);
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
        if (isFirstStep)
            return;
        onStepChange(currentStepIndex - 1);
    };
    return (_jsxs("div", { className: "space-y-8", children: [showStepIndicator && (_jsx("div", { className: "relative mb-8 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800", children: _jsx("div", { className: "absolute h-full rounded-full bg-linear-to-r from-black to-neutral-800 transition-all duration-300 ease-out", style: {
                        width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                    } }) })), showStepIndicator && (_jsx("div", { className: "flex overflow-hidden rounded-xl border border-neutral-200 bg-background shadow-lg dark:border-neutral-800 dark:bg-black", children: steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = completedSteps.includes(step.id);
                    const isUpcoming = index > currentStepIndex;
                    const canNavigate = index <= currentStepIndex || isCompleted;
                    return (_jsx("div", { role: "button", onClick: () => {
                            if (canNavigate)
                                onStepChange(index);
                        }, className: cn('relative flex-1 p-4 text-center transition-colors duration-300', 'group', index !== 0 && 'border-neutral-200 border-l dark:border-neutral-800', canNavigate
                            ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900'
                            : 'cursor-not-allowed opacity-50', isActive && 'bg-linear-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-black'), title: canNavigate ? 'Go to this step' : 'Complete previous steps first', children: _jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx("div", { className: cn('flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300', isActive && 'bg-primary text-primary-foreground ring-4 ring-neutral-200 dark:ring-neutral-800', isCompleted && 'bg-background text-primary', isUpcoming && 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400', !isActive &&
                                        !isCompleted &&
                                        !isUpcoming &&
                                        'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'), children: isCompleted ? (_jsx(Check, { className: "h-4 w-4" })) : (_jsx("span", { className: "font-semibold text-sm", children: index + 1 })) }), _jsx("span", { className: cn('font-medium text-sm transition-colors duration-300', isActive && 'font-bold', isUpcoming && 'text-muted-foreground'), children: step.title })] }) }, step.id));
                }) })), _jsx(Card, { className: "overflow-hidden rounded-xl border-none bg-background py-0 shadow-xl dark:bg-black", children: _jsx(CardContent, { className: "p-8", children: _jsx("div", { className: "relative", children: currentStep.component }) }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { variant: "outline", onClick: goToPreviousStep, disabled: isFirstStep, className: cn('border-2 px-6 hover:bg-neutral-50 dark:hover:bg-neutral-900', 'disabled:cursor-not-allowed disabled:opacity-50'), children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), " Previous"] }), _jsxs(Button, { onClick: goToNextStep, className: cn('bg-black px-6 text-white hover:bg-neutral-900', 'transition-all duration-300 ease-out'), children: [isLastStep ? 'Complete' : 'Next', !isLastStep && _jsx(ChevronRight, { className: "ml-2 h-4 w-4" })] })] })] }));
}
//# sourceMappingURL=multi-step-form.js.map