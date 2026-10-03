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
  title: 'Delete your account | EzPrep',
  description:
    'How to delete your EzPrep account from the mobile app or request help from support.',
};

const SECTIONS: LegalNavItem[] = [
  { id: 'in-app', title: 'Delete in the app' },
  { id: 'what-happens', title: 'What happens when you delete' },
  { id: 'sign-up-again', title: 'Signing up again' },
  { id: 'help', title: 'Need help' },
];

export default function DeleteAccountPage() {
  return (
    <LegalDocument
      title="Delete your EzPrep account"
      lede="Google Play and privacy rules require a clear way to delete an account you created. Use the steps below in the EZ Prep Android app, or contact us if you need help."
      updated="3 October 2026"
      currentPath="/delete-account"
      sections={SECTIONS}
    >
      <LegalSection id="in-app" title="Delete in the app">
        <p>
          Open the EZ Prep app while signed in, go to{' '}
          <strong>More → Delete account</strong>, and confirm. The app calls our
          servers to soft-delete your account and then signs you out.
        </p>
        <LegalList
          items={[
            'Install EZ Prep from Google Play (or your internal/closed test link).',
            'Sign in with the phone number or Google account you want to remove.',
            'Open the More tab → Delete account → confirm.',
          ]}
        />
      </LegalSection>

      <LegalSection id="what-happens" title="What happens when you delete">
        <p>
          Your account is marked deleted and deactivated. Login identifiers
          (phone, email, Google link) are released so they are no longer tied to
          that account. Past mock-test attempts stay associated with the old
          account id and are not shown on a later signup.
        </p>
      </LegalSection>

      <LegalSection id="sign-up-again" title="Signing up again">
        <p>
          After deletion, signing in again with the same phone number or Google
          account creates a <strong>new</strong> EzPrep student account. It does
          not restore the deleted profile or attempt history.
        </p>
      </LegalSection>

      <LegalSection id="help" title="Need help">
        <p>
          If you cannot open the app, email support and include the phone number
          or Google email on the account. See also our{' '}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
        <LegalContact />
      </LegalSection>
    </LegalDocument>
  );
}
