import type { Metadata } from 'next';
import { brand } from '@/lib/brand';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: `User Policy | ${brand.name}`,
  description:
    `Acceptable use guidelines for ${brand.name} — how to use our exam preparation platform responsibly and respectfully.`,
};

const prohibitedContent = [
  'Sexually explicit, pornographic, or otherwise adult-only material.',
  'Content that may cause harm, injury, emotional distress, or danger to yourself, others, or animals.',
  'Material that could lead to loss or damage of property or personal safety.',
  'Content that targets, exploits, or endangers children in any way.',
  'Anything that breaks applicable laws or encourages unlawful behaviour.',
  'Hateful, violent, abusive, discriminatory, defamatory, harassing, threatening, profane, or otherwise offensive material.',
  'Illegal information, including insider trading details or another party’s confidential trade secrets.',
  'Content that infringes intellectual property, privacy, publicity, or other proprietary rights.',
  'Information you are not legally or contractually allowed to share.',
  'Fraudulent, false, misleading, or deceptive content.',
];

const prohibitedActivities = [
  `Copy, frame, mirror, or reuse ${brand.name} branding, logos, layouts, or platform elements without our written permission.`,
  'Access or interfere with non-public areas of our systems, servers, or provider infrastructure.',
  `Probe, scan, or attempt to breach the security of ${brand.name} or our service partners.`,
  'Bypass or disable security, access controls, or content protection measures on the platform.',
  'Scrape, crawl, harvest, or bulk-download content using bots, scripts, or automated tools outside our approved interfaces.',
  'Send spam, unsolicited promotions, chain messages, or other unauthorized solicitations through the platform.',
  `Use hidden metadata, tags, or branding that misrepresents affiliation with ${brand.name}.`,
  `Use ${brand.name} for unauthorized commercial purposes or in ways not permitted by our Terms of Service.`,
  'Forge headers or send communications that misrepresent their origin through our Services.',
  `Reverse engineer, decompile, or disassemble software used to deliver ${brand.name}.`,
  'Disrupt platform availability through viruses, flooding, overloading, or similar attacks.',
  'Collect personal information from other users without their clear consent.',
  `Impersonate another person, organisation, or misrepresent your relationship with ${brand.name}.`,
  'Violate any applicable law, regulation, or exam-board integrity rules while using the platform.',
  'Ask other users for passwords, OTPs, tokens, or other account credentials.',
  'Share your login details with friends, relatives, or anyone else to study from a single account.',
  'Encourage or assist anyone else in carrying out the restricted activities listed above.',
];

export default function UserPolicyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />

      <article className="flex-1 bg-gradient-to-b from-teal-50/40 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/"
            className="inline-flex text-sm text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
          >
            ← Back to home
          </Link>

          <header className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">
              Legal
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              User Policy
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {brand.name} helps aspirants prepare for government and competitive exams online. To keep
              the platform reliable, fair, and safe for everyone, please use our Services only in
              ways described in this Acceptable Use Policy.
            </p>
          </header>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Content you must not post or share
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              You agree not to upload, publish, or distribute user content on {brand.name} that includes:
            </p>
            <ul className="space-y-3">
              {prohibitedContent.map((item) => (
                <li key={item} className="flex gap-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Activities that are not allowed
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              When using mock tests, study materials, mentorship features, or any other part of
              {brand.name}, you agree not to:
            </p>
            <ul className="space-y-3">
              {prohibitedActivities.map((item) => (
                <li key={item} className="flex gap-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10 rounded-2xl border border-teal-100 bg-teal-50/60 px-5 py-6 sm:px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">How we enforce this policy</h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
              {brand.name} may review, remove, or restrict user content at any time if we believe it
              violates this User Policy, our{' '}
              <Link href="/terms" className="text-teal-600 hover:text-teal-700 font-medium">
                Terms of Service
              </Link>
              , or applicable law — with or without
              prior notice.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We may also suspend or permanently close accounts when we determine, at our sole
              discretion, that a user has breached these rules. {brand.name} is not liable for actions
              taken to protect the platform and its community.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500">
              Questions about this policy? Contact us at{' '}
              <a
                href={`mailto:${brand.supportEmail}`}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {brand.supportEmail}
              </a>
              .
            </p>
            <p className="text-sm text-gray-400 mt-4">Last updated: 11 October 2026</p>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
