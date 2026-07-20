import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import { useInterviewDetailsQuery, useUpdateInterviewMutation } from '../hooks';

/**
 * EditInterviewPage allows students to modify the details, overall advice,
 * and outcomes of a shared experience.
 */
export default function EditInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: interview, isLoading, error } = useInterviewDetailsQuery(id || '');
  const updateMutation = useUpdateInterviewMutation();

  const [role, setRole] = useState('');
  const [degree, setDegree] = useState<'BTECH' | 'MTECH'>('BTECH');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [placementBatch, setPlacementBatch] = useState(new Date().getFullYear());
  const [campusDriveDate, setCampusDriveDate] = useState('');
  const [oaPlatform, setOaPlatform] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [ctc, setCtc] = useState('');
  const [stipend, setStipend] = useState('');
  const [overallExperience, setOverallExperience] = useState('');
  const [tips, setTips] = useState('');
  const [outcome, setOutcome] = useState<'SELECTED' | 'REJECTED' | 'PENDING'>('SELECTED');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  // Pre-seed states once details finish loading
  useEffect(() => {
    if (interview) {
      setRole(interview.role);
      setDegree(interview.degree as 'BTECH' | 'MTECH');
      setBranch(interview.branch);
      setCgpa(String(interview.cgpa));
      setAcademicYear(interview.academicYear);
      setPlacementBatch(interview.placementBatch);
      setCampusDriveDate(interview.campusDriveDate ? interview.campusDriveDate.substring(0, 10) : '');
      setOaPlatform(interview.oaPlatform || '');
      setEligibility(interview.eligibility || '');
      setCtc(interview.ctc ? String(interview.ctc) : '');
      setStipend(interview.stipend ? String(interview.stipend) : '');
      setOverallExperience(interview.overallExperience);
      setTips(interview.tips || '');
      setOutcome(interview.outcome);
      setDifficulty(interview.difficulty);
    }
  }, [interview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !overallExperience) {
      alert('Job role and overall experience summary are required.');
      return;
    }

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      alert('Please enter a valid CGPA between 0.0 and 10.0');
      return;
    }

    if (!/^\d{4}-\d{4}$/.test(academicYear.trim())) {
      alert('Please enter a valid Academic Year (e.g. 2025-2026).');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: id || '',
        data: {
          role,
          degree,
          branch: branch.trim().toUpperCase(),
          cgpa: parsedCgpa,
          academicYear: academicYear.trim(),
          placementBatch: Number(placementBatch),
          campusDriveDate: campusDriveDate || null,
          ctc: interview?.type === 'PLACEMENT' ? parseFloat(ctc) || null : null,
          stipend: interview?.type === 'INTERNSHIP' ? parseInt(stipend, 10) || null : null,
          overallExperience,
          tips,
          outcome,
          difficulty,
          oaPlatform: oaPlatform.trim() || null,
          eligibility: eligibility.trim() || null,
        },
      });
      alert('Interview Experience updated successfully!');
      navigate('/dashboard/interviews');
    } catch (err) {
      alert('Failed to update experience.');
    }
  };

  if (isLoading) {
    return <Loader fullScreen message="Loading experience details..." />;
  }

  if (error || !interview) {
    return (
      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <p className="text-red-500 font-bold">Failed to load experience details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Experience</h1>
        <p className="text-xs text-slate-500 mt-1">Modify your logged reviews for {interview.company.name}.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Job Role Title *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="SDE Intern, full-time SDE 1"
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Degree *</label>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value as any)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="BTECH">B.Tech</option>
              <option value="MTECH">M.Tech</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Branch *"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="CSE, ECE, EEE"
            required
          />
          <Input
            label="CGPA during Recruitment * (Out of 10.0)"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="e.g. 8.45"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Placement Batch * (Graduation Year)"
            type="number"
            value={placementBatch}
            onChange={(e) => setPlacementBatch(parseInt(e.target.value, 10))}
            placeholder="e.g. 2026"
            required
          />
          <Input
            label="Academic Year * (e.g. 2025-2026)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2025-2026"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Campus Drive Date (Optional)"
            type="date"
            value={campusDriveDate}
            onChange={(e) => setCampusDriveDate(e.target.value)}
          />
          <Input
            label="OA Platform (Optional)"
            value={oaPlatform}
            onChange={(e) => setOaPlatform(e.target.value)}
            placeholder="e.g. HackerRank"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interview.type === 'PLACEMENT' ? (
            <Input
              label="Salary Package / CTC (LPA) *"
              type="number"
              step="0.1"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              placeholder="e.g. 18.5"
              required
            />
          ) : (
            <Input
              label="Monthly Stipend (INR/Month) *"
              type="number"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              placeholder="e.g. 50000"
              required
            />
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Verdict *</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as any)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="SELECTED">Selected</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Difficulty *</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <Textarea
          label="Eligibility Criteria / Allowed Branches (Optional)"
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
          placeholder="e.g. CSE/ECE/EEE eligible, CGPA >= 7.5, no active backlogs"
          rows={2}
        />

        <Textarea
          label="Overall Experience Summary *"
          value={overallExperience}
          onChange={(e) => setOverallExperience(e.target.value)}
          placeholder="Review details..."
          rows={5}
        />

        <Textarea
          label="Preparation Tips"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          placeholder="Revise topics..."
          rows={4}
        />

        <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/interviews')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
