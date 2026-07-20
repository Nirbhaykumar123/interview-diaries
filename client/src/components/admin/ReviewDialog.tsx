import { useState } from 'react';
import { useResolveVerificationMutation } from '../../hooks/useAdmin';
import EvidenceViewer from './EvidenceViewer';
import Button from '../common/Button';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';
import { VerificationRequestData } from '../../api/admin.api';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationRequestData | null;
}

/**
 * ReviewDialog renders verification reviewing overlay dialog.
 */
export default function ReviewDialog({ isOpen, onClose, verification }: ReviewDialogProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resolveMutation = useResolveVerificationMutation();

  if (!isOpen || !verification) return null;

  const handleAction = async (status: 'VERIFIED' | 'REJECTED') => {
    setErrorMsg('');

    if (status === 'REJECTED' && rejectionReason.trim().length < 5) {
      setErrorMsg('Please specify a rejection reason of at least 5 characters.');
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        verificationId: verification.id,
        payload: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : undefined,
        },
      });
      alert(`Verification ticket successfully marked as ${status.toLowerCase()}.`);
      // Reset state and close
      setRejectMode(false);
      setRejectionReason('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  const handleClose = () => {
    setRejectMode(false);
    setRejectionReason('');
    setErrorMsg('');
    onClose();
  };

  const isSubmitting = resolveMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-bold text-slate-950 text-sm md:text-base">Review Verification Claim</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Candidate Experience Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Candidate & Experience Details</h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs md:text-sm text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Candidate Name</span>
                <span className="font-semibold">{verification.interview.author.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Company</span>
                <span className="font-semibold">{verification.interview.company.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Role</span>
                <span className="font-semibold">{verification.interview.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Process Type</span>
                <span className="font-semibold">{verification.interview.type} ({verification.interview.year})</span>
              </div>
            </div>
          </div>

          {/* Evidence Preview Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Submitted Document Proof</h4>
            <EvidenceViewer
              evidenceUrl={verification.evidenceUrl}
              evidenceType={verification.evidenceType}
            />
          </div>

          {/* Rejection input box */}
          {rejectMode && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Rejection Explanation</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this proof is invalid (e.g. date mismatch, low resolution document, incorrect template)..."
                rows={3}
                className="w-full text-xs md:text-sm p-3 border border-slate-200 focus:border-slate-950 focus:outline-none rounded-xl bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {rejectMode ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRejectMode(false)}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-bold"
              >
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleAction('REJECTED')}
                className="h-9 px-5 text-xs font-bold bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
              >
                Confirm Rejection
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-bold"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectMode(true)}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Reject Proof
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleAction('VERIFIED')}
                className="h-9 px-5 text-xs font-bold bg-green-600 text-white hover:bg-green-700 border-green-600 hover:border-green-700"
              >
                Approve & Verify
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
