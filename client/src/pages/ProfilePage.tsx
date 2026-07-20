import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Globe, Link2, Code2, Briefcase, GraduationCap, X, Plus } from 'lucide-react';
import { useMeQuery, useUpdateProfileMutation } from '../hooks/useUser';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import AvatarUpload from '../components/profile/AvatarUpload';

// ─── Form Schema ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  college: z.string().max(200).optional(),
  branch: z.string().max(150).optional(),
  graduationYear: z.string().optional(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  currentCompany: z.string().max(150).optional(),
  currentRole: z.string().max(150).optional(),
  isPrivate: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Section Wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputCls = "w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors";

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: user, isLoading } = useMeQuery();
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateProfileMutation();

  // Skills local state separate from the form
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillsInitialized, setSkillsInitialized] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user
      ? {
          fullName: user.fullName,
          college: user.college ?? '',
          branch: user.branch ?? '',
          graduationYear: user.graduationYear ? String(user.graduationYear) : '',
          bio: user.profile?.bio ?? '',
          linkedinUrl: user.profile?.linkedinUrl ?? '',
          githubUrl: user.profile?.githubUrl ?? '',
          portfolioUrl: user.profile?.portfolioUrl ?? '',
          currentCompany: user.profile?.currentCompany ?? '',
          currentRole: user.profile?.currentRole ?? '',
          isPrivate: user.profile?.isPrivate ?? false,
        }
      : undefined,
  });

  // Initialize skills from API once
  if (user && !skillsInitialized) {
    setSkills(user.profile?.skills ?? []);
    setSkillsInitialized(true);
  }

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 30) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onSubmit = handleSubmit((values) => {
    updateProfile({
      fullName: values.fullName,
      college: values.college || undefined,
      branch: values.branch || undefined,
      graduationYear: values.graduationYear ? Number(values.graduationYear) : undefined,
      bio: values.bio || undefined,
      linkedinUrl: values.linkedinUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
      currentCompany: values.currentCompany || undefined,
      currentRole: values.currentRole || undefined,
      isPrivate: values.isPrivate,
      skills,
    });
  });

  if (isLoading) {
    return <Loader message="Loading profile..." />;
  }

  return (
    <div className="space-y-6 max-w-2xl" data-component="profile-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
        <p className="text-sm text-slate-500">Update your bio, credentials, and social links.</p>
      </div>

      {isSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
          ✓ Profile updated successfully!
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Personal Info */}
        <Section title="Personal Information" icon={User}>
          <AvatarUpload avatarUrl={user?.profile?.avatarUrl} fullName={user?.fullName || ''} />
          
          <div className="border-t border-slate-100 pt-5 mt-5 space-y-4">
            <Field label="Full Name" error={errors.fullName?.message}>
              <input {...register('fullName')} className={inputCls} placeholder="Your full name" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="College / University" error={errors.college?.message}>
              <input {...register('college')} className={inputCls} placeholder="e.g. IIT Delhi" />
            </Field>
            <Field label="Branch / Major" error={errors.branch?.message}>
              <input {...register('branch')} className={inputCls} placeholder="e.g. Computer Science" />
            </Field>
          </div>
          <Field label="Graduation Year" error={errors.graduationYear?.message}>
            <input {...register('graduationYear')} type="number" className={inputCls} placeholder="e.g. 2026" />
          </Field>
        </Section>

        {/* Career Info */}
        <Section title="Career" icon={Briefcase}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Current Company" error={errors.currentCompany?.message}>
              <input {...register('currentCompany')} className={inputCls} placeholder="e.g. Microsoft" />
            </Field>
            <Field label="Current Role" error={errors.currentRole?.message}>
              <input {...register('currentRole')} className={inputCls} placeholder="e.g. SDE Intern" />
            </Field>
          </div>
        </Section>

        {/* Bio */}
        <Section title="Bio & Introduction" icon={GraduationCap}>
          <Field label="Bio" error={errors.bio?.message}>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors resize-none"
              placeholder="Write a short introduction about yourself, your interests, and what you've learned from interviews..."
            />
          </Field>
        </Section>

        {/* Skills */}
        <Section title="Technical Skills" icon={GraduationCap}>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X className="h-3 w-3 opacity-70 hover:opacity-100" />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-xs text-slate-400 font-medium">No skills added yet.</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              className={inputCls}
              placeholder="Type a skill and press Enter (e.g. React, Docker)"
            />
            <button
              type="button"
              onClick={addSkill}
              className="h-10 w-10 shrink-0 flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </Section>

        {/* Social Links */}
        <Section title="Social Links" icon={Globe}>
          <Field label="LinkedIn URL" error={errors.linkedinUrl?.message}>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input {...register('linkedinUrl')} className={`${inputCls} pl-9`} placeholder="https://linkedin.com/in/username" />
            </div>
          </Field>
          <Field label="GitHub URL" error={errors.githubUrl?.message}>
            <div className="relative">
              <Code2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input {...register('githubUrl')} className={`${inputCls} pl-9`} placeholder="https://github.com/username" />
            </div>
          </Field>
          <Field label="Portfolio Website" error={errors.portfolioUrl?.message}>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input {...register('portfolioUrl')} className={`${inputCls} pl-9`} placeholder="https://your-portfolio.dev" />
            </div>
          </Field>
        </Section>

        {/* Privacy */}
        <Section title="Privacy Settings" icon={Lock}>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('isPrivate')}
              className="h-4 w-4 mt-0.5 border-slate-300 text-slate-900 rounded focus:ring-slate-900"
            />
            <div>
              <p className="text-sm font-bold text-slate-900">Make profile private</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your profile statistics will be hidden from other students. Your published interview diaries will remain publicly visible.
              </p>
            </div>
          </label>
        </Section>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" className="h-10 px-6" isLoading={isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
