import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ArrowRight,
  CheckCircle2,
  Users,
  Shield,
  TrendingUp,
  Star,
  ChevronRight,
  Zap,
  Globe,
  MessageSquare,
  Building2,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────── */

const STATS = [
  { value: '2,400+', label: 'Experiences Shared' },
  { value: '180+', label: 'Companies Covered' },
  { value: '12,000+', label: 'Students Helped' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Search by Company or Role',
    desc: 'Filter hundreds of real interview diaries by company name, role, year, or outcome to find exactly what you need.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    step: '02',
    icon: BookOpen,
    title: 'Read Detailed Walkthroughs',
    desc: 'Each diary breaks down every interview round—questions asked, tips that worked, and what surprised the candidate.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Share Your Own Story',
    desc: 'Went through a placement interview? Help future students by documenting your experience step-by-step.',
    color: 'from-blue-500 to-indigo-500',
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified Experiences',
    desc: 'Our moderation team reviews submissions to ensure accuracy and authenticity.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Trending Insights',
    desc: 'Discover what\'s hot right now—see which companies and roles are most discussed.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Users,
    title: 'Community Answers',
    desc: 'Comment, ask follow-up questions, and connect with candidates who went through the same process.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Zap,
    title: 'Personal Dashboard',
    desc: 'Track your placement progress, offer rates, and shared diaries in one cohesive workspace.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Globe,
    title: 'All Companies, All Roles',
    desc: 'From FAANG giants to hot startups — software, finance, consulting, and more.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: CheckCircle2,
    title: 'Round-by-Round Detail',
    desc: 'Every diary documents each interview round separately, from OA to HR.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const COMPANIES = [
  'Google', 'Microsoft', 'Stripe', 'Amazon', 'Meta',
  'Flipkart', 'Goldman Sachs', 'Atlassian', 'Razorpay', 'Uber',
];

const TESTIMONIALS = [
  {
    quote: "Reading three Google SWE experiences here helped me crack my own interview. I knew exactly what to expect in each round.",
    name: 'Aarav Mehta',
    role: 'SDE-1 at Google',
    initials: 'AM',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    quote: "I documented my Goldman Sachs experience right after the offer. Felt great to give back to students who helped me prepare.",
    name: 'Priya Nair',
    role: 'Analyst at Goldman Sachs',
    initials: 'PN',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    quote: "The filtering is incredible. I searched 'Stripe Backend 2024' and got exactly 7 detailed walkthroughs. Saved weeks of prep.",
    name: 'Rohan Singh',
    role: 'Backend Engineer at Stripe',
    initials: 'RS',
    color: 'from-rose-500 to-pink-500',
  },
];

/* ──────────────────────────────────────────────
   SECTION: HERO
────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      className="hero-mesh relative overflow-hidden pb-24 pt-20 md:pt-28 lg:pt-36"
      aria-labelledby="hero-heading"
    >
      {/* Decorative blurred orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(ellipse, #8b5cf6 0%, transparent 70%)' }}
      />

      <div className="container relative z-10 mx-auto px-6 md:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          Trusted by 12,000+ students across India
        </div>

        {/* Main Headline */}
        <h1
          id="hero-heading"
          className="animate-fade-up delay-100 mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]"
        >
          Real interviews.{' '}
          <span className="gradient-text">Real stories.</span>
          <br />
          Real preparation.
        </h1>

        {/* Sub-headline */}
        <p className="animate-fade-up delay-200 mx-auto mt-7 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl">
          Browse thousands of first-hand campus placement and internship interview
          experiences. Filter by company, role, and year — then share your own story
          to pay it forward.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/search"
            id="hero-cta-browse"
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5"
          >
            Browse Experiences
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/register"
            id="hero-cta-share"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5"
          >
            Share Your Story
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Social proof avatars */}
        <div className="animate-fade-up delay-400 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex -space-x-2">
            {['AM', 'PR', 'RS', 'KV', 'NP'].map((initials, i) => (
              <div
                key={initials}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm"
                style={{
                  background: [
                    'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    'linear-gradient(135deg,#10b981,#06b6d4)',
                    'linear-gradient(135deg,#f59e0b,#ef4444)',
                    'linear-gradient(135deg,#3b82f6,#6366f1)',
                    'linear-gradient(135deg,#ec4899,#8b5cf6)',
                  ][i],
                }}
              >
                {initials}
              </div>
            ))}
          </div>
          <span>
            Join <span className="font-semibold text-slate-700">12,000+</span> students already prepping smarter
          </span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: LIVE STATS BAR
────────────────────────────────────────────── */
function StatsBar() {
  return (
    <section className="border-y border-slate-200 bg-white py-10" aria-label="Platform statistics">
      <div className="container mx-auto px-6 md:px-8">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`animate-fade-up text-center delay-${(i + 1) * 100}`}
            >
              <dt className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {value}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-500">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: HOW IT WORKS
────────────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="bg-white py-24 md:py-32" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 mb-4">
            How It Works
          </span>
          <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From search to success in three steps
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Whether you're preparing or sharing, Interview Diaries makes the process effortless.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
            <div
              key={step}
              className={`animate-fade-up delay-${(i + 1) * 150} group relative rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-50`}
            >
              {/* Step number watermark */}
              <span className="absolute top-6 right-6 text-6xl font-black text-slate-100 group-hover:text-indigo-50 transition-colors select-none">
                {step}
              </span>

              {/* Icon */}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} mb-5 shadow-sm`}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: COMPANIES TICKER
────────────────────────────────────────────── */
function CompaniesSection() {
  return (
    <section className="bg-slate-50 py-20 overflow-hidden" aria-labelledby="companies-heading">
      <div className="container mx-auto px-6 md:px-8 text-center mb-10">
        <h2 id="companies-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Experiences from{' '}
          <span className="gradient-text">top companies</span>
        </h2>
        <p className="mt-3 text-slate-500">From FAANG to funded startups — we cover them all.</p>
      </div>

      {/* Scrolling logo ticker */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-slate-50 to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent" />

        <div className="flex gap-4 w-max" style={{ animation: 'scroll-x 22s linear infinite' }}>
          {[...COMPANIES, ...COMPANIES].map((name, i) => (
            <Link
              key={`${name}-${i}`}
              to={`/companies`}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 whitespace-nowrap shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md hover:-translate-y-0.5"
            >
              <Building2 className="h-4 w-4 text-slate-400" />
              {name}
            </Link>
          ))}
        </div>

        <style>{`
          @keyframes scroll-x {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: FEATURES GRID
────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="bg-white py-24 md:py-32" aria-labelledby="features-heading">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block rounded-full bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-600 mb-4">
            Why Interview Diaries?
          </span>
          <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to{' '}
            <span className="gradient-text">prep with confidence</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <div
              key={title}
              className={`animate-fade-up delay-${(i % 3) * 100 + 100} hover-lift rounded-2xl border border-slate-100 p-7`}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg} mb-4`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: TESTIMONIALS
────────────────────────────────────────────── */
function TestimonialsSection() {
  return (
    <section className="bg-slate-50 py-24 md:py-32" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mx-auto max-w-xl text-center mb-14">
          <span className="inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600 mb-4">
            What Students Say
          </span>
          <h2 id="testimonials-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From our community
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initials, color }, i) => (
            <figure
              key={name}
              className={`animate-fade-up delay-${(i + 1) * 150} hover-lift glass-card rounded-2xl p-7 shadow-sm`}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm text-slate-600 leading-relaxed mb-6">
                "{quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br ${color} flex-shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{name}</div>
                  <div className="text-xs text-slate-500">{role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   SECTION: FINAL CTA BANNER
────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden bg-slate-900 py-24"
      aria-labelledby="cta-heading"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 120%, rgba(139,92,246,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="container relative z-10 mx-auto px-6 md:px-8 text-center">
        <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Ready to ace your next interview?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          Join thousands of students who use Interview Diaries to walk into every
          interview fully prepared.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            id="cta-get-started"
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all hover:bg-indigo-400 hover:-translate-y-0.5"
          >
            Get Started — It's Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/search"
            id="cta-browse-link"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5"
          >
            Browse Diaries
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            100% free forever
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Community verified
          </span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PAGE ROOT
────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main id="main-content">
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <CompaniesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaBanner />
    </main>
  );
}
