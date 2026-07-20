import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldAlert, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

// ─── Change Password Schema ───────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, danger, children }: {
  title: string;
  icon: React.ElementType;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 space-y-5 ${danger ? 'border-red-200' : 'border-slate-200'}`}>
      <div className={`flex items-center gap-2 border-b pb-4 ${danger ? 'border-red-100' : 'border-slate-100'}`}>
        <Icon className={`h-4 w-4 ${danger ? 'text-red-500' : 'text-slate-500'}`} />
        <h3 className={`text-sm font-bold ${danger ? 'text-red-700' : 'text-slate-900'}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function PasswordInput({ id, placeholder, register, error }: {
  id: string;
  placeholder: string;
  register: any;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...register}
          className="w-full h-10 px-3 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Deactivation confirmation input state
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // ── Change Password Form ──────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const {
    mutate: changePassword,
    isPending: changePending,
    isSuccess: changeSuccess,
    error: changeError,
  } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/me/password', data),
    onSuccess: () => reset(),
  });

  const onChangePassword = handleSubmit((values) => {
    changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  });

  // ── Deactivate Account ────────────────────────────────────────────────────
  const {
    mutate: deactivate,
    isPending: deactivatePending,
    error: deactivateError,
  } = useMutation({
    mutationFn: (password: string) => api.post('/users/me/deactivate', { password }),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your password and account security.</p>
      </div>

      {/* Change Password */}
      <Section title="Change Password" icon={Lock}>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your new password must be at least 8 characters long and contain at least one uppercase letter and one number.
        </p>

        {changeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
            ✓ Password changed successfully.
          </div>
        )}

        {changeError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {(changeError as any)?.response?.data?.message ?? 'Failed to change password.'}
          </div>
        )}

        <form onSubmit={onChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Current Password</label>
            <PasswordInput
              id="currentPassword"
              placeholder="Enter your current password"
              register={register('currentPassword')}
              error={errors.currentPassword?.message}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">New Password</label>
            <PasswordInput
              id="newPassword"
              placeholder="Enter a strong new password"
              register={register('newPassword')}
              error={errors.newPassword?.message}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repeat the new password"
              register={register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" className="h-10 px-6" isLoading={changePending}>
              Update Password
            </Button>
          </div>
        </form>
      </Section>

      {/* Deactivate Account */}
      <Section title="Danger Zone" icon={ShieldAlert} danger>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 space-y-1">
              <p className="font-bold">Deactivate Account</p>
              <p className="font-medium leading-relaxed">
                Deactivating your account will immediately sign you out across all devices.
                Your profile, interview diaries, and data will be preserved but your account
                will be inaccessible. Contact support to reactivate.
              </p>
            </div>
          </div>

          {!showDeactivateConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeactivateConfirm(true)}
              className="text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
            >
              I want to deactivate my account
            </button>
          ) : (
            <div className="space-y-3 border border-red-200 bg-red-50/50 rounded-xl p-4">
              <p className="text-xs font-bold text-red-700">
                Confirm with your current password to proceed:
              </p>

              {deactivateError && (
                <p className="text-xs text-red-600 font-semibold">
                  {(deactivateError as any)?.response?.data?.message ?? 'Deactivation failed.'}
                </p>
              )}

              <div className="relative">
                <input
                  type="password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="w-full h-10 px-3 bg-white border border-red-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => deactivate(deactivatePassword)}
                  disabled={!deactivatePassword || deactivatePending}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  {deactivatePending ? 'Deactivating…' : 'Confirm Deactivation'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeactivateConfirm(false); setDeactivatePassword(''); }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
