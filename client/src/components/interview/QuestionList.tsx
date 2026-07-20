import { HelpCircle } from 'lucide-react';

interface QuestionListProps {
  questions: string[];
}

/**
 * QuestionList renders coding questions or discussion topics asked during a round.
 */
export default function QuestionList({ questions }: QuestionListProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
        <HelpCircle className="h-4 w-4 text-slate-400" />
        <span>Questions Asked</span>
      </div>
      <ul className="list-inside list-disc pl-1 space-y-1.5 text-sm text-slate-600 leading-relaxed">
        {questions.map((question, index) => (
          <li key={index} className="marker:text-slate-400">
            <span className="font-mono text-slate-800 bg-slate-100/50 px-1.5 py-0.5 rounded border border-slate-200/40 text-xs">
              {question}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
