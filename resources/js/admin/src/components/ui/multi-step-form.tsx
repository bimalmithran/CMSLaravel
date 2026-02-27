import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';

export type Step = {
    label: string;
    content: React.ReactNode;
    validate?: () => string | null | Promise<string | null>;
};

interface MultiStepFormProps {
    steps: Step[];
    onSubmit: () => Promise<void> | void;
    onCancel: () => void;
    saving: boolean;
    saveText?: string;
}

export function MultiStepForm({
    steps,
    onSubmit,
    onCancel,
    saving,
    saveText = 'Submit',
}: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    // Updated to support an array of error strings
    const [err, setErr] = useState<string | string[] | null>(null);

    const handleNext = async () => {
        setErr(null);
        const validate = steps[currentStep].validate;
        if (validate) {
            const error = await validate();
            if (error) {
                setErr(error);
                return;
            }
        }
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setErr(null);
        setCurrentStep((prev) => prev - 1);
    };

    const handleFinalSubmit = async () => {
        setErr(null);
        const validate = steps[currentStep].validate;
        if (validate) {
            const error = await validate();
            if (error) {
                setErr(error);
                return;
            }
        }

        try {
            await onSubmit();
        } catch (error) {
            if (error instanceof Error) {
                // Try to parse the error message as a JSON array of strings
                try {
                    const parsed = JSON.parse(error.message);
                    if (Array.isArray(parsed)) {
                        setErr(parsed);
                        return;
                    }
                } catch {
                    // If it's not JSON, just fall through and show the normal string
                }
                setErr(error.message);
            } else {
                setErr('An error occurred while saving.');
            }
        }
    };

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < steps.length - 1) {
            void handleNext();
        } else {
            void handleFinalSubmit();
        }
    };

    return (
        <div className="flex w-full flex-col">
            <div className="mb-6 flex items-center justify-between px-2">
                {steps.map((step, idx) => {
                    const isActive = currentStep === idx;
                    const isPassed = currentStep > idx;
                    return (
                        <div
                            key={step.label}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-200 ${
                                    isPassed
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : isActive
                                          ? 'border-primary text-primary'
                                          : 'border-muted-foreground/30 text-muted-foreground'
                                }`}
                            >
                                {isPassed ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span
                                className={`text-xs ${isActive || isPassed ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={onFormSubmit} className="space-y-6">
                <div className="animate-in duration-300 fade-in slide-in-from-right-2">
                    {steps[currentStep].content}
                </div>

                {/* Updated Error Banner to map through arrays */}
                {err && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {Array.isArray(err) ? (
                            <ul className="list-disc space-y-1 pl-4">
                                {err.map((e, i) => (
                                    <li key={i}>{e}</li>
                                ))}
                            </ul>
                        ) : (
                            err
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-between border-t pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={saving}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Back
                            </Button>
                        )}
                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleFinalSubmit}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : saveText}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
