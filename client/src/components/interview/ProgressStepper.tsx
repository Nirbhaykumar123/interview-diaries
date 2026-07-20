import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProgressStepperProps {
  steps: string[];
  activeStep: number;
}

/**
 * ProgressStepper renders a horizontal wizard navigation stepper
 * displaying completed, active, and pending stages of form submission.
 */
export default function ProgressStepper({ steps, activeStep }: ProgressStepperProps) {
  return (
    <div className="w-full">
      <h2 className="sr-only">Submission Progress Steps</h2>
      
      {/* Stepper bar layout wrapper */}
      <ol className="flex items-center justify-between w-full p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-semibold text-slate-500 overflow-x-auto gap-4">
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;

          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-1.5 shrink-0 select-none pb-1 border-b-2 border-transparent transition-all',
                isActive && 'text-slate-900 border-slate-950 font-bold',
                isCompleted && 'text-slate-900'
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 transition-colors',
                  isActive && 'border-slate-900 bg-slate-900 text-white',
                  isCompleted && 'border-slate-900 bg-slate-900 text-white'
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className="truncate max-w-[80px] sm:max-w-none">{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
