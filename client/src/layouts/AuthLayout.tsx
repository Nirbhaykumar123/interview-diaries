import { Outlet } from 'react-router-dom';

/**
 * AuthLayout handles authentication layouts (Login, Registration, Password resets).
 * It uses a double-split screen layout on desktops, showing brand graphics/quotes
 * on the left and form containers centered on the right.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding / Graphic panel (hidden on mobile viewports) */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Interview Diaries 📚</span>
        </div>
        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed">
              "This platform helped me crack my placement. Reading experiences from senior students who actually faced the interviews gave me immense confidence."
            </p>
            <footer className="text-sm font-medium text-slate-400">
              — Ananya Sharma, Software Engineer at Google
            </footer>
          </blockquote>
        </div>
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} Interview Diaries. All rights reserved.
        </div>
      </div>

      {/* Right Form Display panel */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
