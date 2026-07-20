import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

/**
 * LoginPage coordinates email credentials login submissions and
 * triggers localStorage session stores.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { accessToken, user } = response.data.data;

      // Commit to Auth Provider state and LocalStorage
      login(accessToken, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
        <p className="text-sm text-slate-500">
          Enter your details below to log back in
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@college.edu"
          required
        />
        <Input
          label="Password *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" className="w-full h-10 mt-2" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-slate-950 underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
