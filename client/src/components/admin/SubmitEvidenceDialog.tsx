import { useState } from 'react';
import { useRequestVerificationMutation } from '../../hooks/useAdmin';
import Button from '../common/Button';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';

interface SubmitEvidenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
}

/**
 * SubmitEvidenceDialog is the modal allowing candidates to upload verification proofs.
 */
export default function SubmitEvidenceDialog({ isOpen, onClose, interviewId }: SubmitEvidenceDialogProps) {
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceType, setEvidenceType] = useState('Offer Letter');
  const [errorMsg, setErrorMsg] = useState('');

  const requestMutation = useRequestVerificationMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!evidenceUrl.trim().startsWith('http://') && !evidenceUrl.trim().startsWith('https://')) {
      setErrorMsg('Please enter a valid document link starting with http:// or https://');
      return;
    }

    try {
      await requestMutation.mutateAsync({
        interviewId,
        evidenceUrl: evidenceUrl.trim(),
        evidenceType: evidenceType.trim(),
      });
      alert('Verification request successfully submitted to our moderator queue.');
      setEvidenceUrl('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit request. Please try again.');
    }
  };

  const isSubmitting = requestMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden flex flex-col transform transition-all scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-bold text-slate-950 text-sm md:text-base font-black">Request Verification</h3>
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
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            To earn the blue trust checkmark badge next to your post, provide a link to verifiable proof 
            (e.g. an image upload, cloud document link, LinkedIn share, offer document). 
            Our moderation team will review it.
          </p>

          {/* Evidence Category selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Document Type</label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
            >
              <option value="Offer Letter">Offer Letter / Intent document</option>
              <option value="Internship Certificate">Completion Certificate</option>
              <option value="Placement Cell Record">Placement Portal screenshot</option>
              <option value="Other">Other verifiable source</option>
            </select>
          </div>

          {/* Evidence URL Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400">Verifiable Link / URL</label>
            <input
              type="url"
              required
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://drive.google.com/file/... or image link"
              className="block h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="h-9 px-5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
