import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | EzPrep',
  description:
    'How EzPrep collects, uses, and protects your personal information when you use our exam preparation platform.',
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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
          </header>

          <Section title="General">
            <p>
              By using, accessing, or participating in the EzPrep service (the
              &quot;Service&quot;), you agree to this Privacy Policy. Capitalised terms not
              defined here have the meanings given in our{' '}
              <Link href="/terms-of-service" className="text-teal-600 hover:text-teal-700 font-medium">
                Terms of Service
              </Link>
              .
            </p>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we
              will post a notice on the website for at least seven (7) days and update the revision
              date below. Changes take effect at the earlier of (i) the end of that notice period or
              (ii) your next use of the Service after the update. If you do not agree with the
              revised policy, please stop using the Service.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>
              When you sign in with your mobile number, EzPrep uses our authentication partners to
              verify your identity and link your account to your phone number. This helps us secure
              access to mock tests, study materials, and other features tied to your profile.
            </p>
            <p>
              When you use the Service, you provide us with two types of information: (i) information
              you submit through the Service, and (ii) information about how you use the Service that
              we collect as you interact with it.
            </p>
            <p>
              When you visit our website, we collect your browser type and IP address. This applies
              to all visitors. We also use cookies — small data files stored on your device — to
              keep you signed in, remember preferences, and improve performance. Session cookies help
              confirm authenticated access. Most browsers let you control cookies; disabling them may
              limit certain features such as personalised content or saved login state.
            </p>
            <p>During registration or profile setup, you may provide details such as:</p>
            <BulletList
              items={[
                'Name, mobile number, and email address',
                'Location or hometown',
                'Exam preferences and other information requested in the signup flow',
              ]}
            />
            <p>
              As you use EzPrep, you may update your profile, attempt mock tests, bookmark content,
              generate performance analytics, and send messages or feedback. We store this information
              to operate the Service, personalise your experience, and improve our products.
            </p>
          </Section>

          <Section title="How we use your information">
            <p>
              We may use your contact details to send service announcements, account alerts, exam
              updates, and information about new features or partner offerings we believe may be
              useful. Where permitted, you can opt out of promotional messages, but we may still
              send essential account or security notices.
            </p>
            <p>
              Profile information is primarily used to display your account details to you and, where
              applicable, to other users in features that support community or mentorship interactions.
            </p>
            <p>
              We may use aggregated or anonymised data — including usage and performance analytics —
              to understand platform trends, improve content quality, and develop new features. Such
              data may be used by EzPrep and shared with partners in a form that does not identify
              you personally.
            </p>
            <p>
              To request deletion of your personal data, email{' '}
              <a href="mailto:support@ezprep.in" className="text-teal-600 hover:text-teal-700 font-medium">
                support@ezprep.in
              </a>
              .
            </p>
          </Section>

          <Section title="Sharing information with third parties">
            <p>
              EzPrep shares personally identifiable information only when reasonably necessary to
              provide the Service, comply with law, protect our users, or with your consent. For
              example:
            </p>
            <BulletList
              items={[
                'Hosting providers, email delivery services, payment processors, and analytics tools that help us operate the platform may access limited data solely to perform services on our behalf.',
                'Authentication and messaging providers may process your mobile number to deliver OTP verification and account-related notifications.',
                'Mobile SDKs or notification services may collect device identifiers, app usage data, or similar technical information to deliver push alerts and measure engagement, subject to your device permissions.',
                'We may disclose information when required by law, court order, or government request, or when we believe disclosure is necessary to prevent fraud, protect rights, or address security issues.',
                'If EzPrep or relevant parts of our business are acquired or transferred, your information may be passed to the successor entity, still subject to this Privacy Policy.',
              ]}
            />
          </Section>

          <Section title="Your choices and opt-out options">
            <BulletList
              items={[
                'Push notifications: You can disable push alerts in your device Settings under Notifications and adjust permissions for the EzPrep app or browser.',
                'Interest-based advertising: On Android, open Google Settings → Ads to opt out of personalised ads. On iOS, use Settings → Privacy → Apple Advertising. Device menus may vary by version.',
                'Marketing emails: Use the unsubscribe link in promotional messages where provided, or contact support@ezprep.in.',
              ]}
            />
          </Section>

          <Section title="Analytics and customer support tools">
            <p>
              We use third-party analytics and support tools to understand how users interact with
              EzPrep and to respond to enquiries. These providers may receive limited account
              information — such as signup date, email, or mobile number — and usage data through
              cookies or similar technologies. They process this data on our behalf to help us
              improve the Service and communicate with you.
            </p>
            <p>
              Some support or messaging tools may connect you with other services (for example,
              payment providers). Those third parties have their own privacy policies, which we
              encourage you to review before using their features.
            </p>
          </Section>

          <Section title="Links and third-party services">
            <p>
              The Service may contain links to external websites. We are not responsible for the
              privacy practices of other sites. We encourage you to read their privacy statements
              when you leave EzPrep.
            </p>
            <p>
              EzPrep may embed or integrate third-party content — including{' '}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                YouTube
              </a>{' '}
              videos on concept and learning pages. By using those features, you may also be subject
              to YouTube&apos;s terms and{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Google&apos;s privacy policies
              </a>
              . We use YouTube services to display video content and related metadata where
              applicable.
            </p>
            <p>
              EzPrep is an independent ed-tech company offering exam preparation for Union and State
              government examinations. We do not represent any government department, exam authority,
              or private organisation unless explicitly stated in a specific partnership.
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
