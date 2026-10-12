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
import { brand } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Terms of Service | ${brand.name}`,
  description: `Terms and conditions for using ${brand.name} — online exam preparation, mock tests, Google sign-in, and related services.`,
};

const SECTIONS: LegalNavItem[] = [
  { id: 'general', title: 'General' },
  { id: 'service', title: 'The Service' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'Accounts and Google Sign-In' },
  { id: 'plans', title: 'Plans and payments' },
  { id: 'no-guarantee', title: 'No guarantee of results' },
  { id: 'your-responsibilities', title: 'Your responsibilities' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'content', title: 'Our content' },
  { id: 'privacy', title: 'Privacy' },
  { id: 'cancellation', title: 'Cancellation' },
  { id: 'refunds', title: 'Refunds' },
  { id: 'disclaimer', title: 'Disclaimer of warranties' },
  { id: 'liability', title: 'Limitation of liability' },
  { id: 'indemnity', title: 'Indemnity' },
  { id: 'termination', title: 'Termination' },
  { id: 'force-majeure', title: 'Force majeure' },
  { id: 'grievance', title: 'Contact and grievance redressal' },
  { id: 'copyright', title: 'Copyright complaints' },
  { id: 'law', title: 'Governing law' },
  { id: 'miscellaneous', title: 'Miscellaneous' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      lede={`These terms govern your use of ${brand.name}. They explain what the service is, how accounts and payments work, and the limits of our responsibility.`}
      updated="11 October 2026"
      currentPath="/terms"
      sections={SECTIONS}
    >
      <LegalSection id="general" title="General">
        <p>
          The {brand.name} website, apps, and related services (together, the &quot;Service&quot;) are
          operated by {brand.legalName}, {brand.legalAddress} (&quot;{brand.name}&quot;, &quot;we&quot;, or
          &quot;us&quot;). Your access to and use of the Service is governed by these Terms of
          Service (&quot;Terms&quot;). By creating an account, signing in, or using any part of the
          Service, you confirm that you have read, understood, and agree to these Terms.
        </p>
        <p>
          If you do not agree, do not use the Service. These Terms apply together with our{' '}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/user-policy" className={legalLinkClass}>
            User Policy
          </Link>
          .
        </p>
        <p>
          We may revise these Terms from time to time. If we make material changes, we will post a
          notice on the website for at least seven (7) days and update the revision date at the top
          of this page. Updated Terms take effect at the earlier of (i) the end of that notice
          period or (ii) your next use of the Service after the changes are posted. If you do not
          agree with the updated Terms, you must stop using the Service.
        </p>
      </LegalSection>

      <LegalSection id="service" title="Description of the Service">
        <p>
          {brand.name} helps users prepare for government and competitive examinations through mock tests,
          question banks, study materials, performance analytics, mentorship, and related learning
          tools. We may add, modify, suspend, or discontinue any part of the Service at any time,
          temporarily or permanently.
        </p>
        <p>
          {brand.name} is an independent education company. We do not represent, and are not affiliated
          with, any government department, public service commission, railway recruitment board, or
          other exam authority unless we say so in writing for a specific partnership. Official
          exam notifications, syllabi, and results are issued by those authorities, not by {brand.name}.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="Eligibility">
        <p>
          You must be at least 18 years old, or use the Service with the consent and supervision of
          a parent or legal guardian who agrees to these Terms on your behalf. You must be able to
          form a binding contract under applicable law. The Service is offered from India and is
          intended for users who can lawfully access it.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="Accounts and Google Sign-In">
        <p>When you register for or use the Service, you agree to:</p>
        <LegalList
          items={[
            'Provide accurate, current, and complete information about yourself when requested.',
            'Keep your password, OTP, and other account credentials confidential.',
            'Promptly update your registration details so they remain accurate and complete.',
            'Accept responsibility for all activity that occurs under your account.',
            `Allow ${brand.name} to contact you by phone, SMS, or email regarding your account, service updates, promotional offers, order status, and product information, where permitted by law.`,
          ]}
        />
        <p>
          You may sign in with a mobile number or with Google. If you choose Sign in with Google,
          you authorise {brand.name} to receive your Google account email address, name, profile picture,
          and a unique Google account identifier, as described in our Privacy Policy. We use that
          information to create and authenticate your {brand.name} account. We do not access your Gmail,
          Google Drive, contacts, calendar, or other Google services.
        </p>
        <p>
          Your Google account remains subject to Google&apos;s own terms and privacy policy. You can
          revoke {brand.name}&apos;s access from your Google Account settings. Doing so may prevent you
          from signing in with Google until you grant access again. You are responsible for the
          security of the Google account you use to access {brand.name}.
        </p>
        <p>
          Do not share your login with anyone else. One account is for one person. We may refuse
          registration, or require additional verification, if we believe an account is inaccurate,
          shared, or being used in breach of these Terms.
        </p>
      </LegalSection>

      <LegalSection id="plans" title="Plans and payments">
        <p>
          Some content on the Service is free. Other content is available only with a paid plan. Before
          you pay, each plan shows what it includes, how long access lasts (a fixed period or lifetime),
          and its price.
        </p>
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong className="text-gray-800">Prices.</strong> All prices are in Indian Rupees and
            include GST. The amount shown at checkout is the total you pay.
          </li>
          <li>
            <strong className="text-gray-800">One-time payment.</strong> Plans do not renew
            automatically. We do not store your card or other payment details, and we never charge you
            again unless you choose to buy again. There are no free trials that turn into paid plans.
          </li>
          <li>
            <strong className="text-gray-800">Payment processing.</strong> Payments are processed by
            Razorpay, a third-party payment gateway, using card, UPI, net banking, wallet, or other
            methods it offers. You enter your payment details on Razorpay&apos;s secure checkout;{' '}
            {brand.name} does not receive or store your full card or bank details. Razorpay&apos;s
            terms and privacy policy also apply to the payment.
          </li>
          <li>
            <strong className="text-gray-800">When access starts.</strong> Access starts as soon as
            your payment is confirmed. If you buy a plan you already have active access to, the new
            period starts when your current access ends. A plan you already own for life cannot be
            bought again.
          </li>
          <li>
            <strong className="text-gray-800">Tax invoice.</strong> A GST tax invoice is issued by{' '}
            {brand.legalName} for every payment and is available under Subscriptions in your account.
            Please enter accurate billing details at checkout. The invoice uses the details you
            provide, and the state you choose determines the GST applied.
          </li>
          <li>
            <strong className="text-gray-800">Personal use.</strong> A plan is for your own account. It
            may not be shared, transferred, or resold.
          </li>
          <li>
            <strong className="text-gray-800">Changes.</strong> We may change prices or plans at any
            time. A change never affects a plan you have already paid for.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="no-guarantee" title="No guarantee of exam results">
        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 px-5 py-5 sm:px-6 space-y-3">
          <p>
            {brand.name} provides preparation materials and practice tools only. We do not guarantee that
            you will pass, qualify, obtain a particular rank, or be selected in any examination.
            Questions, patterns, cut-offs, and results are decided by the relevant exam authority
            and can change without notice to us.
          </p>
          <p>
            Study material, mock tests, analytics, and mentor comments are educational aids. They
            may contain errors or become outdated. You are responsible for checking official
            notifications and for how you use any information from the Service. You use {brand.name} at
            your own risk.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="your-responsibilities" title="Your representations and warranties">
        <p>
          You represent that your use of the Service complies with these Terms and with all
          applicable laws, including laws of India and your place of residence relating to online
          conduct, acceptable content, and data transmission. You also represent that you own or
          control any material you submit to {brand.name} and that you have the right to grant us the
          licences needed to operate the Service.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="Acceptable use">
        <p>You must not upload, display, or provide through the Service any content that:</p>
        <LegalList
          items={[
            'Is libellous, defamatory, abusive, threatening, harassing, hateful, offensive, unlawful, or infringes third-party rights (including copyright, trademark, privacy, or publicity rights).',
            `In ${brand.name}’s reasonable judgment, is objectionable, restricts others from using the Service, or exposes ${brand.name} or its users to harm or liability.`,
          ]}
        />
        <p>
          You must also follow our User Policy. That includes not scraping content, sharing
          accounts, cheating systems, disrupting the platform, or misusing other users&apos;
          information.
        </p>
      </LegalSection>

      <LegalSection id="content" title="Proprietary rights and trademarks">
        <p>
          All content made available through the Service — including text, graphics, images,
          software, videos, mock tests, study material, layouts, and compilations (&quot;Service
          Content&quot;) — is owned by {brand.name} or its licensors. You may not copy, distribute,
          modify, sell, scrape, frame, or exploit Service Content except as expressly allowed in
          these Terms, or for your own personal, non-commercial exam preparation.
        </p>
        <p>
          Data generated from your use of learning activities on the Service (&quot;Activity
          Data&quot;) may be owned by {brand.name}, except for content you submit as personal
          communications such as feedback. By using the Service, you grant {brand.name} the rights needed
          to host, analyse, and improve the platform using such Activity Data.
        </p>
        <p>
          &quot;{brand.name}&quot; and related logos are trademarks of {brand.name} or its licensors. Use of the
          Service does not grant you any licence to reproduce {brand.name} or third-party trademarks,
          service marks, or branding.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy">
        <p>
          Your use of the Service is also subject to our{' '}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>
          . By using {brand.name}, you acknowledge the collection and use of information as described in
          that policy, including the limited Google account details we receive if you sign in with
          Google.
        </p>
      </LegalSection>

      <LegalSection id="cancellation" title="Cancellation policy">
        <p>
          You can cancel a purchase at any time before completing payment by closing the payment
          window. Nothing is charged.
        </p>
        <p>
          Access is granted immediately once payment is confirmed, so a completed purchase cannot be
          cancelled. Plans do not renew, so there is nothing to cancel for future periods. If we
          suspend or end your access for a breach of these Terms, no refund is due except where the
          law requires one.
        </p>
      </LegalSection>

      <LegalSection id="refunds" title="Refund policy">
        <p>
          Paid plans give immediate access to digital content. Once access has been granted, payments
          are non-refundable, except in the cases below.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-gray-800">Duplicate payment.</strong> If you are charged more than
            once for the same purchase, the extra payment is refunded automatically to the original
            payment method. You do not need to ask.
          </li>
          <li>
            <strong className="text-gray-800">Money debited but purchase not confirmed.</strong> Please
            do not pay again. We keep checking with Razorpay for up to 72 hours. If the payment went
            through, your access is granted automatically. If it did not, any amount held is released
            by your bank, usually within 5–7 working days.
          </li>
          <li>
            <strong className="text-gray-800">Service failure.</strong> If a technical problem on our
            side stops you from using content you paid for, and we cannot fix it within 7 days of your
            report, you may request a full refund.
          </li>
          <li>
            <strong className="text-gray-800">Where the law requires a refund.</strong>
          </li>
        </ol>
        <p>Any other refund is at our discretion.</p>
        <p>
          <strong className="text-gray-800">How to request a refund.</strong> Email{' '}
          <a href={`mailto:${brand.supportEmail}`} className={legalLinkClass}>
            {brand.supportEmail}
          </a>{' '}
          within 30 days of payment, from your registered email address or quoting your registered
          mobile number, with the invoice or order number and the reason. We acknowledge every
          request within 48 hours.
        </p>
        <p>
          <strong className="text-gray-800">Processing.</strong> Approved refunds are initiated within
          5–7 working days to the original payment method. Your bank usually credits the amount within
          a further 5–7 working days. A refund ends the access that the refunded plan gave. If a later
          purchase of the same plan was waiting to start, it starts immediately instead. A credit note
          is issued for the refunded amount.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="Disclaimer of warranties">
        <p>
          The Service, including all content, software, images, audio, documents, and related
          materials, is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the
          fullest extent permitted by law, {brand.name} and its suppliers disclaim all warranties,
          express or implied, including merchantability, fitness for a particular purpose,
          accuracy, and non-infringement.
        </p>
        <p>
          We do not warrant uninterrupted availability, error-free operation, that defects will be
          corrected, or that the Service or its servers are free of harmful components. We do not
          warrant that mock tests, scores, rankings, or study material match any current official
          paper or will produce any exam outcome.
        </p>
        <p>
          Some jurisdictions do not allow certain warranty exclusions, so parts of this section may
          not apply to you. Nothing in these Terms excludes liability that cannot legally be
          excluded, including liability for fraud or for death or personal injury caused by
          negligence where such an exclusion is prohibited.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, {brand.name} and its directors, officers, employees, and
          partners will not be liable for any indirect, incidental, special, consequential,
          exemplary, or punitive damages, or for any loss of profits, goodwill, data, opportunity,
          or exam outcome, arising out of or related to your use of, or inability to use, the
          Service — even if we were advised that such damages were possible.
        </p>
        <p>
          {brand.name}&apos;s total liability to you for all claims relating to the Service is limited to
          the amount you paid to {brand.name} for the Service in the twelve (12) months before the event
          giving rise to the claim, or INR 1,000, whichever is greater. This cap applies in
          aggregate across all related claims.
        </p>
        <p>
          You acknowledge that {brand.name} makes the Service available in reliance on the disclaimers
          and limits in these Terms, and that those limits are an essential basis of the bargain
          between you and {brand.name}.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" title="Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless {brand.name} and its directors, officers,
          employees, contractors, agents, suppliers, licensors, successors, and assigns from any
          claims, losses, liabilities, damages, and expenses (including reasonable legal fees)
          arising from your use of the Service, your breach of these Terms, your violation of any
          law or third-party right, any content you submit, or any misrepresentation you make to
          us.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="Termination">
        <p>
          {brand.name} may suspend or terminate your access to the Service at any time if we reasonably
          believe you have breached these Terms, created risk or legal exposure for us or other
          users, or if we discontinue the Service. We may do so without prior notice where notice
          is not practical. You may close your account by contacting support.
        </p>
        <p>
          Sections relating to intellectual property, disclaimers, indemnity, liability limits,
          governing law, and other provisions that by their nature should survive will remain in
          effect after termination. Termination does not entitle you to a refund except where these
          Terms or applicable law require one.
        </p>
      </LegalSection>

      <LegalSection id="force-majeure" title="Force majeure">
        <p>
          {brand.name} is not liable for any delay or failure to perform caused by events beyond our
          reasonable control, including natural disasters, war, terrorism, labour disputes, power or
          internet failures, hosting outages, government action, changes in exam schedules by an
          authority, or failures of third-party services such as payment, messaging, or sign-in
          providers.
        </p>
      </LegalSection>

      <LegalSection id="grievance" title="Contact and grievance redressal">
        <p>
          <strong className="text-gray-800">Seller.</strong> {brand.legalName}, {brand.legalAddress}.
        </p>
        <p>
          <strong className="text-gray-800">Customer support.</strong> Email{' '}
          <a href={`mailto:${brand.supportEmail}`} className={legalLinkClass}>
            {brand.supportEmail}
          </a>
          {brand.supportPhone ? `, phone ${brand.supportPhone}` : null}.
        </p>
        <p>
          <strong className="text-gray-800">Grievance Officer.</strong> In accordance with the Consumer
          Protection Act, 2019, the Consumer Protection (E-Commerce) Rules, 2020, and the Information
          Technology Act, 2000 and the rules under it, our Grievance Officer is:
        </p>
        <p>
          {brand.grievanceOfficerName ? `${brand.grievanceOfficerName}, ` : null}
          Grievance Officer, {brand.legalName}
          <br />
          Email:{' '}
          <a href={`mailto:${brand.supportEmail}`} className={legalLinkClass}>
            {brand.supportEmail}
          </a>
          {brand.supportPhone ? ` · Phone: ${brand.supportPhone}` : null}
        </p>
        <p>
          Please include your registered email address or mobile number, the order or invoice number
          if relevant, and a clear description of the issue. We acknowledge every complaint within 48
          hours and resolve it within one month of receipt. You may also contact the National Consumer
          Helpline on 1915 or at consumerhelpline.gov.in.
        </p>
      </LegalSection>

      <LegalSection id="copyright" title="Copyright complaints">
        <p>
          If you believe material on the Service infringes your copyright, send a written notice to
          {brand.name} including:
        </p>
        <LegalList
          items={[
            'Your physical or electronic signature, or that of an authorised representative.',
            'Identification of the copyrighted work claimed to have been infringed.',
            'The location of the allegedly infringing material on the Service.',
            'Your contact details (address, phone, and email).',
            'A statement of good-faith belief that the use is not authorised.',
            'A statement that the information provided is accurate and that you are the copyright owner or authorised to act on their behalf.',
          ]}
        />
        <p>
          Send copyright notices to{' '}
          <a href={`mailto:${brand.supportEmail}`} className={legalLinkClass}>
            {brand.supportEmail}
          </a>
          . You may also refer to the Copyright Act, 1957 and consult legal counsel for guidance.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing law">
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law rules.
          Subject to applicable law, the courts in {brand.legalJurisdiction}, India have exclusive
          jurisdiction over disputes arising out of these Terms or the Service.
        </p>
      </LegalSection>

      <LegalSection id="miscellaneous" title="Miscellaneous">
        <p>
          These Terms, together with the Privacy Policy and User Policy, are the entire agreement
          between you and {brand.name} regarding the Service and replace prior agreements on the same
          subject. If any provision is held unenforceable, the remaining provisions remain in full
          effect. Our failure to enforce a provision is not a waiver of future enforcement.
        </p>
        <p>
          You may not assign these Terms without our consent. {brand.name} may assign its rights and
          obligations, including in connection with a merger, acquisition, or sale of assets. These
          Terms bind and benefit both parties and their permitted successors and assigns. Headings
          are for convenience only.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalDocument>
  );
}
