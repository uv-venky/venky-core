import type React from 'react';
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
export declare function MultiStepForm({ steps, currentStepIndex, onComplete, onStepChange, isStepComplete, showStepIndicator, }: MultiStepFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=multi-step-form.d.ts.map