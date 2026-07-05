import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | EzPrep',
  description:
    'Terms and conditions for using EzPrep — online exam preparation, mock tests, and related services.',
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Website and service terms and conditions for EzPrep.
            </p>
          </header>

          <Section title="General">
            <p>
              The EzPrep website and related services (together, the &quot;Service&quot;) are
              operated by EzPrep Technologies Pvt. Ltd. (&quot;EzPrep&quot;, &quot;we&quot;, or
              &quot;us&quot;). Your access to and use of the Service is governed by these Terms
              of Service (&quot;Terms&quot;). By using any part of the Service, you confirm that you
              have read, understood, and agree to these Terms, including any future updates.
            </p>
            <p>
              We may revise these Terms from time to time. If we make material changes, we will
              post a notice on the website for at least seven (7) days and update the revision date
              at the bottom of this page. Updated Terms take effect at the earlier of (i) the end of
              that notice period or (ii) your next use of the Service after the changes are posted.
              If you do not agree with the updated Terms, you must stop using the Service.
            </p>
          </Section>

          <Section title="Description of the Service">
            <p>
              EzPrep enables users to prepare for government and competitive examinations online
              through mock tests, question banks, study materials, performance analytics, mentorship,
              and related learning tools you choose to access. We may add, modify, suspend, or
              discontinue any part of the Service at any time, temporarily or permanently, at our
              sole discretion.
            </p>
          </Section>

          <Section title="Registration">
            <p>When you register for or use the Service, you agree to:</p>
            <BulletList
              items={[
                'Provide accurate, current, and complete information about yourself or your organisation when requested.',
                'Keep your password and account credentials confidential.',
                'Promptly update your registration details so they remain accurate and complete.',
                'Accept full responsibility for all activity that occurs under your account.',
                'Allow EzPrep to contact you by phone, SMS, or email regarding your account, service updates, promotional offers, order status, and product information — even if you are registered on DND/DNC/NCPR lists, where permitted by law.',
                'Provide examination-related information when requested for internal analytics and service improvement. Failure to provide required information may limit your access to certain features. No refund will be issued solely because access was restricted for missing information. We will not use this data for unrelated purposes or share it with third parties without lawful grounds.',
              ]}
            />
          </Section>

          <Section title="Subscriptions and payments">
            <p>
              You may purchase monthly or annual subscriptions through our website or authorised
              third-party platforms. Payment may be processed by EzPrep or by platform providers
              such as Apple or Google. Subscription prices are shown at the time of purchase.
              EzPrep may change pricing or run promotions at any time, subject to applicable law.
            </p>
            <p>
              Unless stated otherwise, subscription payments are non-refundable. Paid subscriptions
              renew automatically unless cancelled in accordance with these Terms. If you subscribed
              through a third-party store and have a billing dispute, contact that platform
              directly. For subscriptions purchased on EzPrep, reach us at{' '}
              <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                support@ezprep.in
              </a>
              .
            </p>
            <p>
              <strong className="text-gray-800">Free trial.</strong> We may offer a limited free
              trial. Unless you cancel before the trial ends, your subscription may automatically
              convert to a paid plan.
            </p>
            <p>
              <strong className="text-gray-800">Automatic renewal.</strong> By subscribing, you
              authorise recurring billing at the then-current rate plus applicable taxes. Renewal
              charges use the same billing cycle as your active plan unless you cancel at least
              twenty-four (24) hours before renewal.
            </p>
          </Section>

          <Section title="Your representations and warranties">
            <p>
              You represent that your use of the Service complies with these Terms and with all
              applicable laws, including laws of India and your place of residence relating to
              online conduct, acceptable content, and data transmission. You also represent that
              you own or control any material you submit to EzPrep and that you have the right to
              grant us the licences needed to operate the Service.
            </p>
          </Section>

          <Section title="Inappropriate use">
            <p>You must not upload, display, or provide through the Service any content that:</p>
            <BulletList
              items={[
                'Is libellous, defamatory, abusive, threatening, harassing, hateful, offensive, unlawful, or infringes third-party rights (including copyright, trademark, privacy, or publicity rights).',
                'In EzPrep’s reasonable judgment, is objectionable, restricts others from using the Service, or exposes EzPrep or its users to harm or liability.',
              ]}
            />
          </Section>

          <Section title="Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless EzPrep and its directors, officers,
              employees, contractors, agents, suppliers, licensors, successors, and assigns from
              any claims, losses, liabilities, damages, and expenses (including reasonable legal
              fees) arising from your use of the Service, your breach of these Terms, any
              misrepresentation made to us, or any claim that services provided to you were
              inaccurate or defective.
            </p>
          </Section>

          <Section title="Disclaimer of warranties">
            <p>
              The Service, including all content, software, images, audio, documents, and related
              materials, is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
              EzPrep and its suppliers disclaim all warranties, express or implied, including
              merchantability, fitness for a particular purpose, and non-infringement. We do not
              warrant uninterrupted availability, error-free operation, accuracy, completeness, or
              specific exam results. Some jurisdictions do not allow certain warranty exclusions,
              so parts of this section may not apply to you.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, EzPrep will not be liable for indirect,
              incidental, special, consequential, or exemplary damages — including loss of profits,
              business interruption, data loss, or corruption — arising from your use of or inability
              to use the Service, even if we were advised such damages were possible.
            </p>
            <p>
              EzPrep’s total liability to you for any claim relating to the Service is limited to
              the amount you paid to EzPrep for the Service in the twelve (12) months before the
              event giving rise to the claim. This cap applies in aggregate across all related
              claims.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              EzPrep may suspend or terminate your access to the Service at any time, for any
              reason, without prior notice. You may close your account by following in-product
              instructions or contacting support. Sections relating to intellectual property,
              disclaimers, indemnity, liability limits, governing law, and other provisions that
              should survive termination will remain in effect.
            </p>
          </Section>

          <Section title="Proprietary rights">
            <p>
              All content made available through the Service — including text, graphics, images,
              software, videos, mock tests, study material, layouts, and compilations (&quot;Service
              Content&quot;) — is owned by EzPrep or its licensors. You may not copy, distribute,
              modify, sell, scrape, frame, or exploit Service Content except as expressly allowed
              in these Terms.
            </p>
            <p>
              Data generated from your use of learning activities on the Service (&quot;Activity
              Data&quot;) may be owned by EzPrep, except for content you submit for translation or
              similar personal submissions. By using the Service, you grant EzPrep the rights
              needed to host, analyse, and improve the platform using such Activity Data.
            </p>
          </Section>

          <Section title="Trademarks">
            <p>
              &quot;EzPrep&quot; and related logos are trademarks of EzPrep or its licensors. Use of
              the Service does not grant you any licence to reproduce EzPrep or third-party
              trademarks, service marks, or branding.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              Your use of the Service is also subject to our{' '}
              <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-700 font-medium">
                Privacy Policy
              </Link>
              . By using EzPrep, you consent to the collection and use of information as described
              in that policy.
            </p>
          </Section>

          <Section title="Cancellation policy">
            <BulletList
              items={[
                'Cancellation requests are considered only if made within twenty-four (24) hours of placing an order, and only before the order is fulfilled or digital access credentials are issued.',
                'Limited-time promotional offers may not be eligible for cancellation.',
                'If you believe a product or service received is materially different from what was described, notify customer support within twenty-four (24) hours of receipt. We will review and decide on an appropriate resolution.',
              ]}
            />
          </Section>

          <Section title="Refund policy">
            <p>
              Refunds may be available for eligible products or services until they are dispatched
              or until online access credentials are shared with you. To request a refund, email{' '}
              <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                support@ezprep.in
              </a>{' '}
              with your order details and reason for the request. Approved refunds are typically
              processed within fourteen (14) business days using the original payment method.
            </p>
          </Section>

          <Section title="Grievance redressal">
            <p>
              In accordance with the Information Technology Act, 2000, applicable rules, and the
              Consumer Protection (E-Commerce) Rules, 2020, you may contact our Grievance Officer:
            </p>
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm sm:text-base">
              <p className="font-semibold text-gray-800">Grievance Officer</p>
              <p>EzPrep Technologies Pvt. Ltd.</p>
              <p>
                Email:{' '}
                <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                  support@ezprep.in
                </a>
              </p>
              <p>Kochi, India</p>
            </div>
          </Section>

          <Section title="Copyright complaints">
            <p>
              If you believe material on the Service infringes your copyright, send a written
              notice to EzPrep including:
            </p>
            <BulletList
              items={[
                'Your physical or electronic signature, or that of an authorised representative.',
                'Identification of the copyrighted work claimed to have been infringed.',
                'The location of the allegedly infringing material on the Service.',
                'Your contact details (address, phone, and email).',
                'A statement of good faith belief that the use is not authorised.',
                'A statement, under penalty of perjury where applicable, that the information provided is accurate and that you are the copyright owner or authorised to act on their behalf.',
              ]}
            />
            <p>
              Send copyright notices to{' '}
              <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                support@ezprep.in
              </a>
              . You may also refer to Section 51 of the Copyright Act, 1957 and consult legal
              counsel for guidance.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These Terms are governed by the laws of India. Any dispute relating to these Terms or
              the Service shall be subject to the exclusive jurisdiction of the courts in Kochi,
              Kerala, India.
            </p>
          </Section>

          <Section title="Miscellaneous">
            <p>
              These Terms constitute the entire agreement between you and EzPrep regarding the
              Service. If any provision is held unenforceable, the remaining provisions remain in
              full effect. Failure by EzPrep to enforce a provision is not a waiver of future
              enforcement. EzPrep may assign its rights and obligations under these Terms. These
              Terms bind and benefit both parties and their permitted successors and assigns.
            </p>
          </Section>

          <section className="border-t border-gray-200 pt-8">
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 mb-6">
              <p className="font-semibold text-gray-800 mb-1">EzPrep Technologies Pvt. Ltd.</p>
              <p>Kochi, India</p>
              <p>
                <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                  support@ezprep.in
                </a>
              </p>
            </div>
            <p className="text-sm text-gray-400">Last updated: May 25, 2026</p>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}
