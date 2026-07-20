import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/common/Button';

/**
 * VerifyEmailPage extracts the verification token from the query params,
 * calls the backend verification endpoint, and displays the success/error outcome.
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your link.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data?.message || 'Your email has been verified successfully!');
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired or is invalid.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="space-y-6 text-center animate-fade-in">
      {status === 'verifying' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-xl font-semibold text-slate-800">Verifying Email</h1>
          <p className="text-sm text-slate-500">Checking your secure activation link...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activation Successful</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            {message}
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-slate-600 max-w-sm">
            <p className="font-semibold text-slate-700 mb-1">Welcome aboard!</p>
            <p>Your student profile is now active. You can log in to share, search, and view interview experiences for on-campus placements and internships.</p>
          </div>
          <Link to="/login" className="w-full">
            <Button variant="primary" className="w-full h-10">
              Go to Sign In
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Failed</h1>
          <p className="text-sm text-red-600 max-w-sm">
            {message}
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-slate-600 max-w-sm space-y-2">
            <p className="font-semibold text-slate-700">Possible issues:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>The verification token has expired (expires in 24 hours).</li>
              <li>The link was already used or is malformed.</li>
            </ul>
          </div>
          <div className="flex gap-3 w-full">
            <Link to="/register" className="flex-1">
              <Button variant="outline" className="w-full h-10">
                Register Again
              </Button>
            </Link>
            <Link to="/login" className="flex-1">
              <Button variant="primary" className="w-full h-10">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
