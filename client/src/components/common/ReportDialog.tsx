import { useState } from 'react';
import { useCreateReportMutation } from '../../hooks/useReport';
import { ReportReason } from '../../api/report.api';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId?: string;
  commentId?: string;
}

/**
 * ReportDialog renders a content violation reporting modal window.
 */
export default function ReportDialog({ isOpen, onClose, interviewId, commentId }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const createReportMutation = useCreateReportMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReportMutation.mutateAsync({
        interviewId,
        commentId,
        reason,
        details: details.trim() || undefined,
      });
      alert('Content reported successfully. Our moderation team will review this shortly. Thank you!');
      setDetails('');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-slate-950 text-sm md:text-base">Flag Content</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Violation Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="SPAM">Spam or Unsolicited Promotion</option>
              <option value="ABUSIVE">Abusive, Hateful, or Harassing Content</option>
              <option value="FALSE_INFORMATION">False or Misleading Information</option>
              <option value="DUPLICATE">Duplicate or Copied Content</option>
              <option value="OTHER">Other Violation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Details / Explanation (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide context or links that help our moderators review this claim..."
              rows={3}
              maxLength={500}
              className="w-full text-xs md:text-sm p-3 border border-slate-200 focus:border-slate-900 rounded-xl focus:outline-none bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <div className="text-[10px] text-right text-slate-400">
              {details.length}/500 characters
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={createReportMutation.isPending}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createReportMutation.isPending}
              className="h-9 px-5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 border-red-600 hover:border-red-700"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
