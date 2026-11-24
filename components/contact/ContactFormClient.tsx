'use client';

import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { ServiceOfferingRecord } from '@/lib/types';

interface ContactFormClientProps {
  services: ServiceOfferingRecord[];
  contactEmail: string;
  initialService?: string;
}

const BUDGET_RANGES = [
  'Under $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Hackathon / Collaboration',
];

export default function ContactFormClient({
  services,
  contactEmail,
  initialService,
}: ContactFormClientProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState(
    initialService || services[0]?.title || 'Full-Stack Platforms & Interactive 3D Web'
  );
  const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[1]);
  const [timeline, setTimeline] = useState('4–6 Weeks');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          organization,
          phone,
          serviceType,
          budgetRange,
          timeline,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Please review your form inputs.');
        toast.error(data.error || 'Unable to submit inquiry');
      } else {
        setSubmittedId(data.inquiry.id);
        toast.success('Inquiry logged in TurboBits Studio CRM.');
      }
    } catch {
      setError('Network error while submitting your inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pb-24 pt-10 md:px-8 md:pt-14">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">Client Desk</p>
          <h1 className="tb-display mt-3 text-[clamp(2.8rem,6.5vw,5.2rem)] font-semibold leading-[0.95]">
            Get in touch.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#52525B] sm:text-base dark:text-[#8E8E93]">
            Share your engineering brief, product timeline, or recruitment inquiry. Submissions go
            directly into our Studio CRM inbox reviewed by the TurboBits leads.
          </p>

          <div className="mt-8 space-y-4 rounded-[24px] border border-black/10 bg-[#EAEAE5] p-6 dark:border-white/12 dark:bg-[#0B0B0D]">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#0033FF]" />
              <a
                href={`mailto:${contactEmail}`}
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </div>
            <p className="font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
              Typical engineering response time · Under 24 hours
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {submittedId ? (
            <div
              data-testid="inquiry-confirmation"
              className="rounded-[28px] border border-black/10 bg-[#EAEAE5] p-8 md:p-12 dark:border-white/12 dark:bg-[#0B0B0D]"
            >
              <CheckCircle2 className="h-10 w-10 text-[#0033FF]" />
              <h2 className="tb-display mt-5 text-3xl font-semibold">Brief received.</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#52525B] dark:text-[#8E8E93]">
                Thank you, <strong>{name}</strong>. Your inquiry has been logged in the TurboBits
                Admin CRM (reference <code className="font-mono">{submittedId}</code>). We will
                reply to <strong>{email}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmittedId(null);
                  setName('');
                  setEmail('');
                  setOrganization('');
                  setPhone('');
                  setMessage('');
                }}
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-xs font-medium hover:border-[#0033FF] dark:border-white/20"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-[28px] border border-black/10 bg-[#EAEAE5] p-7 md:p-10 dark:border-white/12 dark:bg-[#0B0B0D]"
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="inq-name" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Full Name *
                  </label>
                  <input
                    id="inq-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="inq-email" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Work Email *
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="inq-org" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Organization / Startup
                  </label>
                  <input
                    id="inq-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Meridian Labs"
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="inq-phone" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    id="inq-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label htmlFor="inq-service" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Service Area
                  </label>
                  <select
                    id="inq-service"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Custom Engineering / Advisory">Custom Engineering / Advisory</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inq-budget" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Budget Range
                  </label>
                  <select
                    id="inq-budget"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="inq-timeline" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                    Target Timeline
                  </label>
                  <input
                    id="inq-timeline"
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="4–6 Weeks"
                    className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inq-message" className="block font-mono text-xs text-[#52525B] dark:text-[#8E8E93]">
                  Project Brief *
                </label>
                <textarea
                  id="inq-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the system you want to build, constraints, and key milestones..."
                  className="mt-1.5 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-[#09090B] dark:border-white/15 dark:bg-[#141416] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-[#0033FF] px-7 py-3 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting...' : 'Send Engineering Brief'}</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
