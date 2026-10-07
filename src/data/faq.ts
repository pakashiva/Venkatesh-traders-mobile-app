import { Ionicons } from '@expo/vector-icons';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'account',
    title: 'Account & Onboarding',
    icon: 'person-circle-outline',
    items: [
      {
        id: 'account-1',
        question: 'How do I open an investment account?',
        answer:
          'Tap Create Account on the sign-in screen, fill in your personal details, upload the required KYC documents, and verify your mobile number with OTP. Once your profile is complete, you can submit a fund request from Add Funds.',
      },
      {
        id: 'account-2',
        question: 'Why is mobile number verification required?',
        answer:
          'Mobile verification helps secure your account and is used for OTP-based login recovery and important alerts related to your investments and withdrawals.',
      },
      {
        id: 'account-3',
        question: 'Can I update my profile details after registration?',
        answer:
          'Yes. Go to More → Profile to review and update your personal information. Some changes, such as identity documents, may require re-verification before they take effect.',
      },
      {
        id: 'account-4',
        question: 'What should I do if I forget my MPIN?',
        answer:
          'On the MPIN unlock screen, tap Forgot MPIN, verify the OTP sent to your registered mobile, and set a new 4-digit MPIN. You can then unlock the app with the new MPIN.',
      },
      {
        id: 'account-5',
        question: 'What should I do if I forget my password?',
        answer:
          'On the Sign In screen, enter your registered mobile number or email, tap Forgot Password, verify the OTP, and set a new password. You can then sign in with mobile/email and the new password.',
      },
    ],
  },
  {
    id: 'investments',
    title: 'Investments & Funding',
    icon: 'trending-up-outline',
    items: [
      {
        id: 'investments-1',
        question: 'What is the minimum investment amount?',
        answer:
          'The minimum and maximum fund amount are set by the company and shown on the new fund request screen. Agreement charges of ₹1,000 are added separately when you submit a new fund request.',
      },
      {
        id: 'investments-2',
        question: 'When does my investment start earning interest?',
        answer:
          'Interest accrual begins once your investment status changes to Active. Until then, the request remains under review and does not earn returns.',
      },
      {
        id: 'investments-3',
        question: 'How is monthly interest calculated?',
        answer:
          'Returns are calculated on a 30-day simple interest cycle at the applicable monthly rate on your principal, and only after your pay date has been reached. TDS is deducted from the gross interest, and the net amount is added to your total earnings.',
      },
      {
        id: 'investments-4',
        question: 'Can I invest in more than one fund at a time?',
        answer:
          'Yes. You can submit multiple fund requests and hold several active investments simultaneously. Each investment is tracked separately under My Investments.',
      },
      {
        id: 'investments-5',
        question: 'Why is my fund request still showing as Pending?',
        answer:
          'Pending means your request is under review or awaiting confirmation of payment. Processing timelines can vary based on verification and banking clearance. Check My Investments for status updates.',
      },
    ],
  },
  {
    id: 'withdrawals',
    title: 'Withdrawals',
    icon: 'wallet-outline',
    items: [
      {
        id: 'withdrawals-1',
        question: 'What is the difference between full and partial withdrawal?',
        answer:
          'Full withdrawal pays out your principal plus accumulated earnings and closes the investment. Partial withdrawal pays out only the principal you request. Agreement charges for new fund requests are collected separately when payment is enabled; withdrawals are not reduced by that charge.',
      },
      {
        id: 'withdrawals-2',
        question: 'What is the minimum balance for partial withdrawal?',
        answer:
          'There is no minimum remaining balance for partial withdrawals. You can withdraw any portion of your principal. To exit the investment completely, use Full Withdrawal.',
      },
      {
        id: 'withdrawals-3',
        question: 'How does partial withdrawal affect future earnings?',
        answer:
          'When a partial withdrawal is approved, your principal is reduced and future interest is calculated on the new principal amount from the approval date.',
      },
      {
        id: 'withdrawals-4',
        question: 'Which bank account will receive my withdrawal payout?',
        answer:
          'Payouts are sent to the bank account you select when submitting the withdrawal request. Ensure your bank details under More → Bank Details are correct before requesting a withdrawal.',
      },
      {
        id: 'withdrawals-5',
        question: 'How long does a withdrawal request take to process?',
        answer:
          'After submission, your request is reviewed and moves through Processing, Approved, and Paid stages. Timelines depend on verification and banking schedules. Track status under Withdrawals.',
      },
    ],
  },
  {
    id: 'earnings',
    title: 'Earnings & TDS',
    icon: 'calculator-outline',
    items: [
      {
        id: 'earnings-1',
        question: 'When are earnings credited to my account?',
        answer:
          'Earnings are credited after each completed 30-day interest period while your investment remains Active, and only once today’s date is on or after your scheduled pay date. You can view accrued earnings on the investment details screen and in Transactions.',
      },
      {
        id: 'earnings-2',
        question: 'How is TDS applied on my returns?',
        answer:
          'TDS is deducted from the gross interest amount each period based on the applicable rate configured for your investment. The net amount after TDS is what gets added to your total earnings.',
      },
      {
        id: 'earnings-3',
        question: 'Where can I see my interest and TDS history?',
        answer:
          'Open More → Transactions to view credits related to investment returns, referral bonuses, and withdrawals. Investment Details also shows total earnings and TDS deducted for each fund.',
      },
      {
        id: 'earnings-4',
        question: 'Do I receive a statement for tax filing?',
        answer:
          'Transaction history in the app serves as your record of earnings and deductions. For formal tax certificates or annual statements, contact our support team with your registered details.',
      },
    ],
  },
  {
    id: 'banking',
    title: 'Bank & Transactions',
    icon: 'card-outline',
    items: [
      {
        id: 'banking-1',
        question: 'How do I add a new bank account?',
        answer:
          'Go to More → Bank Details → Add Bank Account. Enter the account holder name, account number, IFSC code, and bank name. This account can then be used for fund requests and withdrawals.',
      },
      {
        id: 'banking-2',
        question: 'Can I use different bank accounts for investing and withdrawals?',
        answer:
          'Yes. You can save multiple bank accounts and choose the appropriate one when submitting a fund request or withdrawal, as long as the account belongs to you.',
      },
      {
        id: 'banking-3',
        question: 'Why was my withdrawal marked as Rejected?',
        answer:
          'Common reasons include incorrect bank details, name mismatch, insufficient verified balance, or incomplete KYC. Review the withdrawal status and contact support if you need clarification.',
      },
      {
        id: 'banking-4',
        question: 'How do I track all money movement in the app?',
        answer:
          'Use More → Transactions for a consolidated view of fund additions, interest credits, referral bonuses, and withdrawal payouts linked to your account.',
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Referrals',
    icon: 'gift-outline',
    items: [
      {
        id: 'referrals-1',
        question: 'How does the referral program work?',
        answer:
          'Share your unique 6-digit referral code from More → Referrals. When someone invests using your code and their fund becomes Active, you earn a referral bonus on their investment amount.',
      },
      {
        id: 'referrals-2',
        question: 'When is the referral bonus paid?',
        answer:
          'The bonus is credited when the referred investment moves from Pending to Active. The reward is calculated as 1% of the investment amount, with 2% TDS deducted from the bonus.',
      },
      {
        id: 'referrals-3',
        question: 'Can I use my own referral code?',
        answer:
          'No. Self-referrals are not allowed. The referral code must belong to another investor and is validated when the fund request is submitted.',
      },
      {
        id: 'referrals-4',
        question: 'Where can I see my referral earnings?',
        answer:
          'Open More → Referrals to view your referral code, total referrals, earnings summary, and reward history.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & App Usage',
    icon: 'shield-checkmark-outline',
    items: [
      {
        id: 'security-1',
        question: 'Is my financial data secure in the app?',
        answer:
          'Account access is protected by authentication and OTP verification. Sensitive operations such as withdrawals are tied to your verified profile and registered bank accounts.',
      },
      {
        id: 'security-2',
        question: 'Why am I asked to sign in again?',
        answer:
          'For security, full sign-in (mobile or email + password) is required when your 15-day unlock window expires. While the window is valid, each app open asks for your MPIN to unlock.',
      },
      {
        id: 'security-3',
        question: 'How do I enable or disable push notifications?',
        answer:
          'Go to More → Settings → Push Notifications to toggle alerts about fund updates, withdrawal status, and other account activity.',
      },
      {
        id: 'security-4',
        question: 'Who should I contact for account-related issues?',
        answer:
          'For help with investments, withdrawals, KYC, or technical problems, visit More → Help & Support for phone, email, and office contact details.',
      },
    ],
  },
];
