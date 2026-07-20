import { Card, CardContent } from '../common/Card';

/**
 * CompanySkeleton displays an animated grey pulse placeholder card
 * to serve as loading skeletons during server fetches.
 */
export default function CompanySkeleton() {
  return (
    <Card className="animate-pulse border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo placeholder */}
          <div className="h-14 w-14 rounded-xl bg-slate-200" />
          
          <div className="flex-1 space-y-2">
            {/* Title placeholder */}
            <div className="h-4 w-32 rounded bg-slate-200" />
            {/* Badges placeholder */}
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded bg-slate-200" />
              <div className="h-5 w-16 rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Description placeholder */}
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-200" />
        </div>

        {/* Footer info placeholder */}
        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3.5 w-16 rounded bg-slate-200" />
        </div>
      </CardContent>
    </Card>
  );
}
