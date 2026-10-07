import { BRAND_LEGAL_NAME, BRAND_NAME } from '../constants/brandAssets';
import { HELP_SUPPORT_CONTACTS, HELP_SUPPORT_HOURS } from './helpSupport';

export type LegalDocumentId = 'terms' | 'privacy' | 'about';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const supportEmail =
  HELP_SUPPORT_CONTACTS.find((c) => c.id === 'email')?.value ??
  'support@roxrufinancial.in';
const supportPhone =
  HELP_SUPPORT_CONTACTS.find((c) => c.id === 'phone')?.value ??
  '+91 98234 56781';
const officeAddress =
  HELP_SUPPORT_CONTACTS.find((c) => c.id === 'address')?.value ??
  'Mumbai, Maharashtra';

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: `Governing your use of the ${BRAND_NAME} investor application`,
    lastUpdated: '5 September 2026',
    sections: [
      {
        heading: '1. About these terms',
        paragraphs: [
          `These Terms & Conditions (“Terms”) apply when you create an account, submit fund requests, manage investments, or request withdrawals through the ${BRAND_NAME} mobile application (the “App”). The App is operated for investor servicing under the ${BRAND_LEGAL_NAME} business framework.`,
          'By registering or continuing to use the App, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please discontinue use and contact support to close your account.',
        ],
      },
      {
        heading: '2. Eligibility',
        paragraphs: [
          'You must be at least 18 years of age and capable of entering into a binding contract under applicable Indian law. You must provide accurate personal, KYC, bank, and nominee details and keep them up to date.',
        ],
        bullets: [
          'One account per natural person unless we expressly approve otherwise',
          'Valid Indian mobile number and email for OTP and service communication',
          'Bank account held in your name for payouts',
        ],
      },
      {
        heading: '3. Investment requests',
        paragraphs: [
          `Fund requests submitted in the App are requests for acceptance, not confirmed allotments until an authorised operator reviews and marks them Active. Minimum fund amount, agreement charges (₹1,000 per new fund request), interest conventions, and TDS treatment are as disclosed in the App at the time of submission.`,
          'Interest is credited in completed 30-day periods on active principal once both (a) at least 30 days have passed since invested date and (b) the scheduled pay date has been reached. Displayed maturity or projected values are illustrative and depend on continued active status and applicable deductions.',
        ],
      },
      {
        heading: '4. Withdrawals',
        paragraphs: [
          'You may request full or partial withdrawals subject to App rules and operator review. Full withdrawals close the investment after approval and settlement. Partial withdrawals reduce principal; future interest accrues on the revised principal.',
          'Withdrawal net payout equals the requested amount — agreement charges are not deducted from withdrawals. Agreement charges for new fund requests are disclosed in-app and will be collected through payment when that flow is enabled. Processing, On Hold, Approved, Rejected, and Paid statuses are operational stages; payout timing depends on verification and banking cycles.',
        ],
      },
      {
        heading: '5. Bank accounts & nominees',
        paragraphs: [
          'Payouts are sent only to bank accounts you register and select. You are responsible for correct IFSC, account number, and account holder name. Nominee details are used for succession servicing as recorded in your profile and do not by themselves create a separate investment contract with the nominee.',
        ],
      },
      {
        heading: '6. Referrals',
        paragraphs: [
          'Referral rewards, if offered, follow the programme rules shown in Refer & Earn. Invalid, self-referral, or abusive use of codes may be cancelled without payout.',
        ],
      },
      {
        heading: '7. Account security',
        paragraphs: [
          'You must keep your MPIN confidential. OTP verification is used for registration, MPIN recovery, and MPIN change. Notify us promptly if you suspect unauthorised access.',
        ],
      },
      {
        heading: '8. Operator decisions & communications',
        paragraphs: [
          'Investment and withdrawal decisions (approve / reject) are taken by authorised operators. In-app notifications for those decisions are informational; the status shown on the relevant request remains the primary record.',
        ],
      },
      {
        heading: '9. Limitation of liability',
        paragraphs: [
          `To the fullest extent permitted by law, ${BRAND_NAME} / ${BRAND_LEGAL_NAME} are not liable for delays caused by banking partners, incorrect beneficiary details supplied by you, force majeure, or temporary App unavailability. Nothing in these Terms excludes liability that cannot be excluded under applicable law.`,
        ],
      },
      {
        heading: '10. Changes & contact',
        paragraphs: [
          'We may update these Terms to reflect product or regulatory changes. Material updates will be reflected in the App with a revised “Last updated” date.',
          `Questions: ${supportEmail} · ${supportPhone} · ${HELP_SUPPORT_HOURS}. Office: ${officeAddress}.`,
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your information',
    lastUpdated: '5 September 2026',
    sections: [
      {
        heading: '1. Scope',
        paragraphs: [
          `This Privacy Policy explains how ${BRAND_NAME} (serviced under ${BRAND_LEGAL_NAME}) processes personal data when you use the investor App and related support channels.`,
        ],
      },
      {
        heading: '2. Data we collect',
        paragraphs: [
          'We collect information you provide and data generated through App use:',
        ],
        bullets: [
          'Identity & contact: name, mobile, email, date of birth, address, city, state, PIN',
          'KYC identifiers: Aadhaar and PAN numbers as submitted for compliance',
          'Banking: account holder name, account number, IFSC, bank name, account type',
          'Nominee: name, relationship, Aadhaar',
          'Investment & withdrawal records, referral codes, and in-app notifications',
          'Technical logs needed for security, fraud prevention, and service reliability',
        ],
      },
      {
        heading: '3. Why we use your data',
        paragraphs: [
          'We process data to:',
        ],
        bullets: [
          'Create and authenticate your account (including OTP)',
          'Process fund requests, interest accrual, TDS display, and withdrawals',
          'Verify bank ownership for payouts and prevent misuse',
          'Send service notifications for approved or rejected requests',
          'Provide customer support and resolve disputes',
          'Meet legal, audit, and record-keeping obligations',
        ],
      },
      {
        heading: '4. Sharing',
        paragraphs: [
          'We do not sell your personal data. We may share limited data with:',
        ],
        bullets: [
          'Authorised operations staff via the admin portal for review and settlement',
          'Banking / payment partners strictly for payout execution',
          'OTP and infrastructure providers under confidentiality controls',
          'Regulators or courts when required by law',
        ],
      },
      {
        heading: '5. Retention & security',
        paragraphs: [
          'Account and transaction records are retained for as long as your relationship continues and thereafter as required for tax, dispute, and regulatory purposes. We apply access controls, encrypted transport, and role-based admin permissions. No method of transmission or storage is perfectly secure; please protect your MPIN and your device.',
        ],
      },
      {
        heading: '6. Your choices',
        paragraphs: [
          'You may update profile and bank details in the App where available, request support for corrections, and change your MPIN after mobile OTP verification. You may ask about access or deletion subject to legal retention needs.',
        ],
      },
      {
        heading: '7. Contact',
        paragraphs: [
          `Privacy requests: ${supportEmail}. Phone: ${supportPhone}. Hours: ${HELP_SUPPORT_HOURS}. Address: ${officeAddress}.`,
        ],
      },
    ],
  },
  about: {
    id: 'about',
    title: 'About Us',
    subtitle: `${BRAND_NAME} — investor app for managed fund participation`,
    lastUpdated: '5 September 2026',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          `${BRAND_NAME} is the investor-facing mobile experience for customers participating in structured investment arrangements operated under the ${BRAND_LEGAL_NAME} framework. The App is designed for clarity: track principal, accrued earnings, maturity outlook, and withdrawal status in one place.`,
        ],
      },
      {
        heading: 'How the model works',
        paragraphs: [
          'Customers register with KYC and bank details, submit a titled fund request (minimum amount as shown in-app), and pay disclosed agreement charges on new fund requests. Operators review each request. Once Active, interest is tracked in 30-day periods on principal, with TDS reflected as configured.',
          'Withdrawals can be full (exit) or partial (principal reduction). Net payout matches the requested amount with no agreement charge deducted on withdrawal. Customers can cancel Processing withdrawal requests where the App allows. Approvals and rejections generate in-app notifications.',
        ],
      },
      {
        heading: 'What you can do in the App',
        paragraphs: [],
        bullets: [
          'Create and verify your investor account',
          'Submit and track fund requests with custom titles',
          'View portfolio summary and performance on Home',
          'Request full or partial withdrawals to your bank',
          'Manage bank accounts, profile, referrals, and FAQ support',
        ],
      },
      {
        heading: 'Our commitment',
        paragraphs: [
          'We focus on transparent statuses, documented charges, and secure OTP-backed access for registration and MPIN changes. For help with investments, withdrawals, or account issues, reach our support team during business hours.',
          `Contact: ${supportPhone} · ${supportEmail} · ${HELP_SUPPORT_HOURS}`,
          `Registered office: ${officeAddress}`,
        ],
      },
    ],
  },
};

export function getLegalDocument(
  id: LegalDocumentId,
  contacts?: { supportEmail?: string; supportPhone?: string }
): LegalDocument {
  const document = LEGAL_DOCUMENTS[id];
  if (!contacts?.supportEmail && !contacts?.supportPhone) {
    return document;
  }

  const email = contacts.supportEmail?.trim();
  const phone = contacts.supportPhone?.trim();
  const replace = (text: string) => {
    let next = text;
    if (email) next = next.split(supportEmail).join(email);
    if (phone) next = next.split(supportPhone).join(phone);
    return next;
  };

  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      paragraphs: section.paragraphs.map(replace),
      bullets: section.bullets?.map(replace),
    })),
  };
}
