import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LegalContact,
  LegalDocument,
  LegalList,
  LegalSection,
  legalLinkClass,
  type LegalNavItem,
} from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy | EzPrep',
  description:
    'How EzPrep collects, uses, and protects your personal information, including data received when you sign in with Google.',
};

const SECTIONS: LegalNavItem[] = [
  { id: 'google-sign-in', title: 'Google Sign-In' },
  { id: 'general', title: 'General' },
  { id: 'information-we-collect', title: 'Information we collect' },
  { id: 'how-we-use', title: 'How we use information' },
  { id: 'sharing', title: 'Sharing with third parties' },
  { id: 'your-choices', title: 'Your choices' },
  { id: 'security', title: 'Security' },
  { id: 'retention', title: 'Retention and deletion' },
  { id: 'analytics', title: 'Analytics and support' },
  { id: 'third-parties', title: 'Links and other services' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact' },
];

const googleReceives = [
  'Your Google account email address',
  'Your name',
  'Your profile picture',
  'A unique Google account identifier',
];

const googleDoesNotAccess = [
  'Gmail',
  'Google Drive',
  'Contacts',
  'Calendar',
  'Any other Google services',
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      lede="How EzPrep collects, uses, and protects your information when you prepare for exams with us — including data received if you sign in with Google."
      updated="26 September 2026"
      currentPath="/privacy-policy"
      sections={SECTIONS}
    >
      <section id="google-sign-in" className="scroll-mt-6 mb-10 sm:mb-12">
        <div className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
          <div className="bg-teal-500 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold tracking-widest text-teal-50 uppercase">
              Sign in with Google
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-white">
              What EzPrep receives from your Google account
            </h2>
          </div>

          <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            <p>
              When you choose to sign in with Google, EzPrep may receive your Google account email
              address, name, profile picture, and a unique Google account identifier.
            </p>
            <p>
              This information is used to create and authenticate your EzPrep account. EzPrep does
              not access your Gmail, Google Drive, contacts, calendar, or other Google services.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 border-t border-teal-100">
            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">We may receive</p>
              <ul className="space-y-2.5">
                {googleReceives.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5 sm:p-6 bg-gray-50/80 border-t sm:border-t-0 sm:border-l border-teal-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">We do not access</p>
              <ul className="space-y-2.5">
                {googleDoesNotAccess.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 text-xs font-bold border border-gray-200">
                      ×
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-teal-100 px-5 py-4 sm:px-6 text-sm text-gray-600 leading-relaxed space-y-3">
            <p>
              We use Google account data only to provide and secure the EzPrep service: creating
              your account, signing you in, showing your name and profile picture in the app, and
              contacting you about your account. We do not sell Google user data, and we do not use
              it for advertising.
            </p>
            <p>
              EzPrep&apos;s use and transfer of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className={legalLinkClass}
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p>
              You can remove EzPrep&apos;s access at any time from your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className={legalLinkClass}
              >
                Google Account permissions
              </a>
              . To ask us to delete personal data already stored by EzPrep, email{' '}
              <a href="mailto:support@ezprep.in" className={legalLinkClass}>
                support@ezprep.in
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <LegalSection id="general" title="General">
        <p>
          By using, accessing, or participating in the EzPrep service (the &quot;Service&quot;), you
          agree to this Privacy Policy. Capitalised terms not defined here have the meanings given
          in our{' '}
          <Link href="/terms" className={legalLinkClass}>
            Terms of Service
          </Link>
          .
        </p>
        <p>
          EzPrep Technologies Pvt. Ltd. (&quot;EzPrep&quot;, &quot;we&quot;, or &quot;us&quot;) is
          the operator of the Service. This policy explains what we collect, why we collect it, and
          the choices you have.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="Information we collect">
        <p>
          When you sign in with your mobile number, EzPrep uses our authentication partners to
          verify your identity and link your account to your phone number. When you sign in with
          Google, we receive the Google account details described above. Either method helps us
          secure access to mock tests, study materials, and other features tied to your profile.
        </p>
        <p>
          When you use the Service, you provide us with two types of information: (i) information
          you submit through the Service, and (ii) information about how you use the Service that we
          collect as you interact with it.
        </p>
        <p>
          When you visit our website, we collect your browser type and IP address. This applies to
          all visitors. We also use cookies — small data files stored on your device — to keep you
          signed in, remember preferences, and improve performance. Session cookies help confirm
          authenticated access. Most browsers let you control cookies; disabling them may limit
          certain features such as personalised content or saved login state.
        </p>
        <p>During registration or profile setup, you may provide details such as:</p>
        <LegalList
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
      </LegalSection>

      <LegalSection id="how-we-use" title="How we use your information">
        <p>We use personal information to:</p>
        <LegalList
          items={[
            'Create and authenticate your account, including when you sign in with Google or a mobile OTP.',
            'Provide mock tests, study material, bookmarks, analytics, and other features you choose.',
            'Send service announcements, account alerts, exam updates, and — where permitted — information about features or offerings that may be useful.',
            'Display your account details to you and, where a feature supports it, in community or mentorship interactions.',
            'Understand platform trends and improve content, using aggregated or anonymised data that does not identify you personally.',
            'Detect fraud, abuse, and security issues, and comply with law.',
          ]}
        />
        <p>
          Where permitted, you can opt out of promotional messages, but we may still send essential
          account or security notices.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="Sharing information with third parties">
        <p>
          EzPrep shares personally identifiable information only when reasonably necessary to
          provide the Service, comply with law, protect our users, or with your consent. For
          example:
        </p>
        <LegalList
          items={[
            'Hosting providers, email delivery services, payment processors, and analytics tools that help us operate the platform may access limited data solely to perform services on our behalf.',
            'Authentication and messaging providers may process your mobile number to deliver OTP verification and account-related notifications.',
            'If you sign in with Google, Google processes that sign-in under its own terms. We receive only the account details listed in this policy.',
            'Mobile SDKs or notification services may collect device identifiers, app usage data, or similar technical information to deliver push alerts and measure engagement, subject to your device permissions.',
            'We may disclose information when required by law, court order, or government request, or when we believe disclosure is necessary to prevent fraud, protect rights, or address security issues.',
            'If EzPrep or relevant parts of our business are acquired or transferred, your information may be passed to the successor entity, still subject to this Privacy Policy.',
          ]}
        />
        <p>
          We do not sell your personal information. We do not share Google user data with
          advertisers or data brokers.
        </p>
      </LegalSection>

      <LegalSection id="your-choices" title="Your choices and opt-out options">
        <LegalList
          items={[
            'Google access: Open your Google Account permissions and remove EzPrep to stop future sign-in data from being shared with us.',
            'Push notifications: You can disable push alerts in your device Settings under Notifications and adjust permissions for the EzPrep app or browser.',
            'Interest-based advertising: On Android, open Google Settings → Ads to opt out of personalised ads. On iOS, use Settings → Privacy → Apple Advertising. Device menus may vary by version.',
            'Marketing emails: Use the unsubscribe link in promotional messages where provided, or contact support@ezprep.in.',
            'Cookies: Use your browser settings to block or delete cookies. Some sign-in and preference features may stop working.',
          ]}
        />
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          We use reasonable administrative and technical measures to protect personal information,
          including encrypted connections (HTTPS) and access controls around accounts and stored
          data. No method of transmission or storage is completely secure, so we cannot guarantee
          absolute security.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="Retention and deletion">
        <p>
          We keep account and usage information for as long as your account is active and for a
          reasonable period afterwards, so we can provide the Service, resolve disputes, enforce
          our terms, and meet legal obligations. When information is no longer needed, we delete or
          de-identify it.
        </p>
        <p>
          To request deletion of your personal data, email{' '}
          <a href="mailto:support@ezprep.in" className={legalLinkClass}>
            support@ezprep.in
          </a>
          . We may retain limited records where the law requires it, or where we need them to
          prevent fraud or complete an outstanding transaction.
        </p>
      </LegalSection>

      <LegalSection id="analytics" title="Analytics and customer support tools">
        <p>
          We use third-party analytics and support tools to understand how users interact with
          EzPrep and to respond to enquiries. These providers may receive limited account
          information — such as signup date, email, or mobile number — and usage data through
          cookies or similar technologies. They process this data on our behalf to help us improve
          the Service and communicate with you.
        </p>
        <p>
          Some support or messaging tools may connect you with other services (for example, payment
          providers). Those third parties have their own privacy policies, which we encourage you to
          review before using their features.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Links and third-party services">
        <p>
          The Service may contain links to external websites. We are not responsible for the
          privacy practices of other sites. We encourage you to read their privacy statements when
          you leave EzPrep.
        </p>
        <p>
          EzPrep may embed or integrate third-party content — including{' '}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className={legalLinkClass}
          >
            YouTube
          </a>{' '}
          videos on concept and learning pages. By using those features, you may also be subject to
          YouTube&apos;s terms and{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={legalLinkClass}
          >
            Google&apos;s privacy policies
          </a>
          . We use YouTube services to display video content and related metadata where applicable.
        </p>
        <p>
          EzPrep is an independent ed-tech company offering exam preparation for Union and State
          government examinations. We do not represent any government department, exam authority, or
          private organisation unless explicitly stated in a specific partnership.
        </p>
      </LegalSection>

      <LegalSection id="children" title="Children">
        <p>
          EzPrep is intended for people preparing for competitive examinations. We do not knowingly
          collect personal information from children under 13. If you believe a child has provided
          us with personal information, contact{' '}
          <a href="mailto:support@ezprep.in" className={legalLinkClass}>
            support@ezprep.in
          </a>{' '}
          and we will take steps to delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. If we make material changes, we will
          post a notice on the website for at least seven (7) days and update the revision date at
          the top of this page. Changes take effect at the earlier of (i) the end of that notice
          period or (ii) your next use of the Service after the update. If you do not agree with
          the revised policy, please stop using the Service.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalDocument>
  );
}
