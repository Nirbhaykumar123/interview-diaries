import { useState } from 'react';
import Button from '../common/Button';

interface ReplyEditorProps {
  initialValue?: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
}

/**
 * ReplyEditor provides an inline textarea input to add comments/replies or edit them.
 */
export default function ReplyEditor({
  initialValue = '',
  onSubmit,
  onCancel,
  placeholder = 'Write a response...',
  submitLabel = 'Reply',
}: ReplyEditorProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit comment. Please check character limits and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full text-xs md:text-sm p-3 border border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none bg-white transition-all text-slate-800 placeholder-slate-400"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs font-semibold px-4 h-8"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          disabled={!content.trim()}
          className="text-xs font-semibold px-5 h-8 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
