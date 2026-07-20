import { FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';

interface EvidenceViewerProps {
  evidenceUrl: string | null;
  evidenceType: string | null;
}

/**
 * EvidenceViewer handles previewing candidate verification documents.
 */
export default function EvidenceViewer({ evidenceUrl, evidenceType }: EvidenceViewerProps) {
  if (!evidenceUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
        <FileText className="h-8 w-8 mb-2 stroke-[1.5]" />
        <span>No evidence document uploaded for this request.</span>
      </div>
    );
  }

  const isPdf = evidenceUrl.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Evidence Type: {evidenceType || 'UNSPECIFIED'}
        </span>
        <a
          href={evidenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
        >
          Open in New Tab
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {isPdf ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-8 min-h-[300px]">
          <FileText className="h-12 w-12 text-slate-400 mb-3" />
          <p className="text-xs font-semibold text-slate-700 mb-4">PDF Verification Document</p>
          <a href={evidenceUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" className="text-xs h-9 rounded-lg font-bold">
              View Document PDF
            </Button>
          </a>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex items-center justify-center p-1.5 shadow-sm max-h-[450px]">
          <img
            src={evidenceUrl}
            alt="Candidate Verification Document"
            className="object-contain max-h-[400px] w-full rounded-lg"
            onError={(e) => {
              // Fallback if image fails to render
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextElementSibling as HTMLElement;
              if (sib) sib.style.display = 'flex';
            }}
          />
          <div className="hidden flex-col items-center justify-center p-8 text-slate-400 min-h-[200px]">
            <ImageIcon className="h-10 w-10 mb-2" />
            <span className="text-xs">Failed to load preview. Please open in a new tab.</span>
          </div>
        </div>
      )}
    </div>
  );
}
