import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * RegisterPage coordinates NITC signup payloads, inputs validation checks,
 * and handles verification email prompts.
 */
export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('BTECH');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [devVerificationUrl, setDevVerificationUrl] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username || !password || !fullName || !branch || !graduationYear) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    // Client-side NITC Email Regex Validation
    const emailRegex = /^[a-zA-Z0-9.]+_[bBmMpP]\d{6}[a-zA-Z]{2}@nitc\.ac\.in$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Only verified NIT Calicut student emails (<roll_number>@nitc.ac.in) are allowed. Example: nirbhay_b230468ec@nitc.ac.in');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        email: email.trim(),
        username: username.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        college: 'NIT Calicut',
        course,
        branch: branch.trim().toUpperCase(),
        graduationYear: parseInt(graduationYear, 10),
      };

      const res = await api.post('/auth/register', payload);
      if (res.data?.data?._devVerificationUrl) {
        setDevVerificationUrl(res.data.data._devVerificationUrl);
      }
      setRegisteredEmail(email.trim());
      setIsRegistered(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorList = err.response.data.errors
          .map((e: any) => `${e.field.charAt(0).toUpperCase() + e.field.slice(1)}: ${e.message}`)
          .join('\n');
        setErrorMsg(errorList);
      } else {
        setErrorMsg(err.response?.data?.message || 'Registration failed. Please check inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            We have sent a verification link to your academic email:
            <br />
            <strong className="text-slate-800 font-semibold">{registeredEmail}</strong>
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-slate-600 max-w-sm space-y-2">
            <p className="font-semibold text-slate-700">Next Steps:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open your NITC webmail inbox (or check spam/junk).</li>
              <li>Click the secure verification link inside.</li>
              <li>Your account will be activated, and you can log in.</li>
            </ol>
          </div>
          {devVerificationUrl && (
            <div className="w-full max-w-sm p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-center text-emerald-800 space-y-2">
              <p className="font-semibold">Local Development Helper:</p>
              <p className="text-slate-500 mb-2">Click below to activate and verify this account immediately without looking up CLI logs:</p>
              <a 
                href={devVerificationUrl}
                className="inline-block w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
              >
                Verify Email Directly
              </a>
            </div>
          )}
        </div>
        <Link to="/login" className="block">
          <Button variant="primary" className="w-full h-10">
            Proceed to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create NITC Student Account</h1>
        <p className="text-sm text-slate-500">
          Exclusive placement portal for B.Tech & M.Tech students
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600 whitespace-pre-wrap">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          label="Full Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nirbhay Kumar"
          required
        />
        <Input
          label="NITC Student Email Address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nirbhay_b230468ec@nitc.ac.in"
          required
        />
        <Input
          label="Username *"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nirbhay_kumar"
          required
        />
        <Input
          label="Password *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="•••••••• (Min 8 chars, 1 Upper, 1 Lower, 1 Num)"
          required
        />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              required
            >
              <option value="BTECH">B.Tech</option>
              <option value="MTECH">M.Tech</option>
            </select>
          </div>
          <Input
            label="Branch *"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="CSE"
            required
          />
          <Input
            label="Graduation Year *"
            type="number"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder="2026"
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full h-10 mt-2" isLoading={isLoading}>
          Sign Up
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-slate-950 underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  );
}
