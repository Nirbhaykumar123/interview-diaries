import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressStepper from '../components/interview/ProgressStepper';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import { useCreateCompanyMutation, useCompanySuggestionsQuery, useMeQuery, useCreateInterviewMutation } from '../hooks';
import useDebounce from '../hooks/useDebounce';
import { Trash2, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

const FORM_STEPS = [
  'Basic Info',
  'OA Round',
  'Tech Rd 1',
  'Tech Rd 2',
  'Managerial',
  'HR Round',
  'Final Verdict',
  'Review & Submit',
];

interface RoundFormState {
  roundNumber: number;
  roundType: 'ONLINE_TEST' | 'TECHNICAL' | 'HR' | 'MANAGERIAL' | 'GROUP_DISCUSSION' | 'OTHER';
  description: string;
  questionsAsked: string[];
  durationMinutes?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  isActive: boolean; // Flag to check if user actually faced this round
}

export default function CreateInterviewPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Fetch logged-in user profile details for pre-population
  const { data: user } = useMeQuery();
  const createInterviewMutation = useCreateInterviewMutation();

  // 1. Basic Info Form State
  const [companySearch, setCompanySearch] = useState('');
  const debouncedCompanySearch = useDebounce(companySearch, 300);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string } | null>(null);

  const [role, setRole] = useState('');
  const [type, setType] = useState<'INTERNSHIP' | 'PLACEMENT'>('PLACEMENT');
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

  // Auto-fill student details on profile load
  useEffect(() => {
    if (user) {
      if (user.course) setDegree(user.course as 'BTECH' | 'MTECH');
      if (user.branch) setBranch(user.branch);
      if (user.graduationYear) setPlacementBatch(user.graduationYear);
    }
  }, [user]);

  // Fetch company search suggestions
  const { data: suggestions = [] } = useCompanySuggestionsQuery(debouncedCompanySearch);

  // 2. Custom inline company creation dialog support
  const [isRegisteringCompany, setIsRegisteringCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('');
  const createCompanyMutation = useCreateCompanyMutation();

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;
    try {
      const company = await createCompanyMutation.mutateAsync({
        name: newCompanyName,
        industry: newCompanyIndustry || 'Technology',
      });
      setSelectedCompany({ id: company.id, name: company.name });
      setIsRegisteringCompany(false);
      setNewCompanyName('');
      setNewCompanyIndustry('');
    } catch (err) {
      alert('Failed to register company. It might already exist.');
    }
  };

  // 3. Chronological Rounds Form States
  const [rounds, setRounds] = useState<RoundFormState[]>([
    {
      roundNumber: 1,
      roundType: 'ONLINE_TEST',
      description: '',
      questionsAsked: [],
      durationMinutes: 60,
      difficulty: 'MEDIUM',
      isActive: true, // OA is active by default
    },
    {
      roundNumber: 2,
      roundType: 'TECHNICAL',
      description: '',
      questionsAsked: [],
      durationMinutes: 45,
      difficulty: 'MEDIUM',
      isActive: false,
    },
    {
      roundNumber: 3,
      roundType: 'TECHNICAL',
      description: '',
      questionsAsked: [],
      durationMinutes: 45,
      difficulty: 'MEDIUM',
      isActive: false,
    },
    {
      roundNumber: 4,
      roundType: 'MANAGERIAL',
      description: '',
      questionsAsked: [],
      durationMinutes: 30,
      difficulty: 'MEDIUM',
      isActive: false,
    },
    {
      roundNumber: 5,
      roundType: 'HR',
      description: '',
      questionsAsked: [],
      durationMinutes: 30,
      difficulty: 'EASY',
      isActive: false,
    },
  ]);

  // Question manipulation helpers for active rounds
  const handleAddQuestion = (roundIdx: number, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length < 2) {
      alert('Question must be at least 2 characters.');
      return;
    }
    setRounds((prev) =>
      prev.map((r, idx) =>
        idx === roundIdx ? { ...r, questionsAsked: [...r.questionsAsked, trimmed] } : r
      )
    );
  };

  const handleRemoveQuestion = (roundIdx: number, qIdx: number) => {
    setRounds((prev) =>
      prev.map((r, idx) =>
        idx === roundIdx
          ? { ...r, questionsAsked: r.questionsAsked.filter((_, qid) => qid !== qIdx) }
          : r
      )
    );
  };

  // 4. Final Verdict States
  const [outcome, setOutcome] = useState<'SELECTED' | 'REJECTED' | 'PENDING'>('SELECTED');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [overallExperience, setOverallExperience] = useState('');
  const [tips, setTips] = useState('');

  // 5. Submit Mutation trigger
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCompany) {
      alert('Please select a company in Step 1');
      setActiveStep(0);
      return;
    }

    // Validate Job Role
    if (!role.trim() || role.trim().length < 2) {
      alert('Job Role Title must be at least 2 characters.');
      setActiveStep(0);
      return;
    }

    // Validate Overall Experience
    if (!overallExperience.trim() || overallExperience.trim().length < 10) {
      alert('Overall Experience Summary must be at least 10 characters.');
      setActiveStep(6); // Step 7 is Final Verdict (0-indexed 6)
      return;
    }

    // Validate CGPA
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      alert('Please enter a valid CGPA between 0.0 and 10.0');
      setActiveStep(0);
      return;
    }

    // Validate Branch
    if (!branch.trim()) {
      alert('Please enter your branch.');
      setActiveStep(0);
      return;
    }

    // Validate Academic Year
    if (!/^\d{4}-\d{4}$/.test(academicYear.trim())) {
      alert('Please enter a valid Academic Year in YYYY-YYYY format (e.g. 2025-2026).');
      setActiveStep(0);
      return;
    }

    // Validate and process rounds
    const activeRounds = [];
    for (let i = 0; i < rounds.length; i++) {
      const r = rounds[i];
      if (r.isActive) {
        const trimmedDesc = r.description.trim();
        let finalDesc = trimmedDesc;

        if (trimmedDesc.length === 0) {
          finalDesc = 'Discussed interview rounds.';
        } else if (trimmedDesc.length < 10) {
          alert(`Description for Round ${i + 1} (${r.roundType.replace('_', ' ')}) must be at least 10 characters.`);
          setActiveStep(i + 1); // Go to that round's step
          return;
        }

        activeRounds.push({
          roundNumber: activeRounds.length + 1,
          roundType: r.roundType,
          description: finalDesc,
          questionsAsked: r.questionsAsked,
          durationMinutes: Number(r.durationMinutes) || undefined,
          difficulty: r.difficulty,
        });
      }
    }

    if (activeRounds.length === 0) {
      alert('At least one interview round must be marked as faced.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyId: selectedCompany.id,
        role: role.trim(),
        type,
        degree,
        branch: branch.trim().toUpperCase(),
        cgpa: parsedCgpa,
        academicYear: academicYear.trim(),
        placementBatch: Number(placementBatch),
        campusDriveDate: campusDriveDate || undefined,
        ctc: type === 'PLACEMENT' ? parseFloat(ctc) || undefined : undefined,
        stipend: type === 'INTERNSHIP' ? parseInt(stipend, 10) || undefined : undefined,
        outcome,
        difficulty,
        oaPlatform: oaPlatform.trim() || undefined,
        eligibility: eligibility.trim() || undefined,
        overallExperience: overallExperience.trim(),
        tips: tips.trim() || undefined,
        status: 'PUBLISHED' as const,
        rounds: activeRounds,
      };

      await createInterviewMutation.mutateAsync(payload);
      alert('Interview Experience Shared Successfully! 🎉');
      navigate('/companies');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMsgs = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        alert(`Validation failed:\n${errorMsgs}`);
      } else {
        alert(err.response?.data?.message || 'Failed to submit experience. Verify inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedCompany) {
      alert('Please select or register a company before continuing.');
      return;
    }
    if (activeStep === 0 && !role) {
      alert('Please fill in the Job Role.');
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Share Your Story</h1>
        <p className="text-sm text-slate-500 mt-1">Help junior peers prepare by detailing your recruitment process.</p>
      </div>

      {/* stepper widgets */}
      <ProgressStepper steps={FORM_STEPS} activeStep={activeStep} />

      {/* STEP 0: BASIC INFORMATION */}
      {activeStep === 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Step 1: Basic Information</h3>
          
          {/* Company selector suggestions panel */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-700">Company Name</label>
            {selectedCompany ? (
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-900">{selectedCompany.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCompany(null)}
                  className="text-xs text-red-600 font-semibold"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Type company name (e.g. Google)..."
                />
                {companySearch.length >= 2 && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-1 space-y-1">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedCompany({ id: s.id, name: s.name })}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md font-medium"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
                {companySearch.length >= 2 && suggestions.length === 0 && (
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
                    No matching company.{' '}
                    <button
                      type="button"
                      onClick={() => setIsRegisteringCompany(true)}
                      className="font-bold text-slate-900 underline"
                    >
                      Register &quot;{companySearch}&quot; in Platform
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Register inline panel */}
          {isRegisteringCompany && (
            <form onSubmit={handleRegisterCompany} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <p className="text-xs font-bold text-slate-900">Register New Company Profile</p>
              <Input
                label="Company Name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Google, Stripe etc."
              />
              <Input
                label="Industry"
                value={newCompanyIndustry}
                onChange={(e) => setNewCompanyIndustry(e.target.value)}
                placeholder="Technology, Finance, E-Commerce"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsRegisteringCompany(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Register
                </Button>
              </div>
            </form>
          )}

          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Role Title *"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Software Development Engineer Intern, SDE 1"
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Job Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="PLACEMENT">Placement (Full-Time)</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              label="Branch *"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="CSE, ECE, EEE, ME"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input
              label="Placement Batch * (Graduation Year)"
              type="number"
              value={placementBatch}
              onChange={(e) => setPlacementBatch(parseInt(e.target.value, 10))}
              placeholder="e.g. 2026"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Academic Year * (e.g. 2025-2026)"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-2026"
              required
            />
            <Input
              label="Campus Drive Date (Optional)"
              type="date"
              value={campusDriveDate}
              onChange={(e) => setCampusDriveDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="OA Platform (Optional)"
              value={oaPlatform}
              onChange={(e) => setOaPlatform(e.target.value)}
              placeholder="e.g. HackerRank, Mettl, CoCubes"
            />
            {type === 'PLACEMENT' ? (
              <Input
                label="Salary Package / CTC (LPA)"
                type="number"
                step="0.1"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="e.g. 18.5"
              />
            ) : (
              <Input
                label="Monthly Stipend (INR/Month)"
                type="number"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. 50000"
              />
            )}
          </div>

          <Textarea
            label="Eligibility Criteria / Allowed Branches (Optional)"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            placeholder="e.g. CSE/ECE/EEE eligible, CGPA >= 7.5, no active backlogs"
            rows={2}
          />
        </div>
      )}

      {/* STEPS 1 TO 5: ROUNDS DETAILS TIMELINES */}
      {activeStep >= 1 && activeStep <= 5 && (() => {
        const roundIdx = activeStep - 1;
        const currentRound = rounds[roundIdx];
        if (!currentRound) return null;

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Step {activeStep + 1}: {FORM_STEPS[activeStep]}
              </h3>
              
              {/* Skip Toggle checks */}
              <div className="flex items-center">
                <input
                  id={`toggle-round-${roundIdx}`}
                  type="checkbox"
                  checked={currentRound.isActive}
                  onChange={(e) =>
                    setRounds((prev) =>
                      prev.map((r, idx) => (idx === roundIdx ? { ...r, isActive: e.target.checked } : r))
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
                <label htmlFor={`toggle-round-${roundIdx}`} className="ml-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                  I faced this round
                </label>
              </div>
            </div>

            {currentRound.isActive ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Round Type</label>
                    <select
                      value={currentRound.roundType}
                      onChange={(e) =>
                        setRounds((prev) =>
                          prev.map((r, idx) =>
                            idx === roundIdx ? { ...r, roundType: e.target.value as any } : r
                          )
                        )
                      }
                      className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
                    >
                      <option value="ONLINE_TEST">Online Assessment (OA)</option>
                      <option value="TECHNICAL">Technical Interview</option>
                      <option value="MANAGERIAL">Managerial Round</option>
                      <option value="HR">HR Interview</option>
                      <option value="GROUP_DISCUSSION">Group Discussion</option>
                      <option value="OTHER">Other round</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Duration (Mins)"
                      type="number"
                      value={currentRound.durationMinutes || ''}
                      onChange={(e) =>
                        setRounds((prev) =>
                          prev.map((r, idx) =>
                            idx === roundIdx
                              ? { ...r, durationMinutes: parseInt(e.target.value, 10) || undefined }
                              : r
                          )
                        )
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Difficulty</label>
                      <select
                        value={currentRound.difficulty || 'MEDIUM'}
                        onChange={(e) =>
                          setRounds((prev) =>
                            prev.map((r, idx) =>
                              idx === roundIdx ? { ...r, difficulty: e.target.value as any } : r
                            )
                          )
                        }
                        className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Textarea
                  label="Description / Experience"
                  value={currentRound.description}
                  onChange={(e) =>
                    setRounds((prev) =>
                      prev.map((r, idx) => (idx === roundIdx ? { ...r, description: e.target.value } : r))
                    )
                  }
                  placeholder="Detail the topics covered, system design patterns discussed, or tasks requested during this round..."
                  rows={4}
                />

                {/* Question builder */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                  <p className="text-xs font-semibold text-slate-700">Questions Asked</p>
                  
                  {/* List of currently added questions */}
                  {currentRound.questionsAsked.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {currentRound.questionsAsked.map((q, qId) => (
                        <div key={qId} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
                          <span>{q}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(roundIdx, qId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input to append a question */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id={`new-question-input-${roundIdx}`}
                      placeholder="e.g. Reverse a Linked List"
                      className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-slate-900 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          handleAddQuestion(roundIdx, val);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-9 rounded-lg text-xs"
                      onClick={() => {
                        const input = document.getElementById(`new-question-input-${roundIdx}`) as HTMLInputElement;
                        if (input) {
                          handleAddQuestion(roundIdx, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
                You marked this round as skipped. Toggle check to activate and add details.
              </div>
            )}
          </div>
        );
      })()}

      {/* STEP 6: VERDICT & SUMMARY EXPERIENCE */}
      {activeStep === 6 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Step 7: Final Verdict</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Final Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="SELECTED">Selected / Received Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING">Pending / Still In-Process</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Overall Difficulty</label>
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
            label="Overall Experience Summary"
            value={overallExperience}
            onChange={(e) => setOverallExperience(e.target.value)}
            placeholder="Summarize the overall process, timeline speeds, coordinator helps, and recruitment styles..."
            rows={5}
          />

          <Textarea
            label="Preparation Tips & Guidelines"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="What resources, coding sheets, or mock interview strategies do you recommend for future candidates?"
            rows={4}
          />
        </div>
      )}

      {/* STEP 7: REVIEW & SUBMIT SUMMARY PREVIEW */}
      {activeStep === 7 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Step 8: Review & Submit</h3>

          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-bold text-slate-900 border-b border-slate-100 pb-2">Experience Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <p><strong>Company:</strong> {selectedCompany?.name}</p>
              <p><strong>Role:</strong> {role}</p>
              <p><strong>Degree:</strong> {degree}</p>
              <p><strong>Branch:</strong> {branch}</p>
              <p><strong>CGPA:</strong> {cgpa}</p>
              <p><strong>Academic Year:</strong> {academicYear}</p>
              <p><strong>Batch:</strong> Class of {placementBatch}</p>
              {campusDriveDate && <p><strong>Drive Date:</strong> {campusDriveDate}</p>}
              {type === 'PLACEMENT' ? (
                <p><strong>CTC (LPA):</strong> {ctc || 'N/A'}</p>
              ) : (
                <p><strong>Stipend:</strong> {stipend ? `${stipend} INR/Month` : 'N/A'}</p>
              )}
              {oaPlatform && <p><strong>OA Platform:</strong> {oaPlatform}</p>}
              <p><strong>Outcome:</strong> {outcome}</p>
            </div>
            
            <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 pt-4">Rounds Timeline</p>
            <div className="space-y-2 text-xs">
              {rounds.filter(r => r.isActive).map((r, idx) => (
                <div key={idx} className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                  <p className="font-semibold text-slate-800">
                    Round {idx + 1}: {r.roundType} ({r.durationMinutes || 45} Mins, {r.difficulty})
                  </p>
                  <p className="text-slate-500 mt-1">{r.questionsAsked.length} questions listed</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outline"
          className="gap-2 h-10 text-slate-600 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {activeStep === FORM_STEPS.length - 1 ? (
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            variant="primary"
            className="h-10 px-8"
          >
            Submit Experience
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="primary"
            className="gap-2 h-10 px-6 font-semibold"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
