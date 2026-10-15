import { Mail, Globe, PhoneCall, IndianRupee, MessageCircleHeart } from 'lucide-react';

export const CATEGORIES = {
  phishing: {
    key: 'phishing',
    label: 'Phishing Email',
    short: 'Emails',
    Icon: Mail,
    color: '#ff6b8b',
    pitch: 'Fake bank, KYC, reward or delivery emails trying to steal your login, card or OTP.',
    identifier: { label: 'Sender email address', placeholder: 'alerts@secure-bank-verify.com' },
    fields: [
      { name: 'subject', label: 'Email subject', placeholder: 'Your account will be suspended in 24 hours' },
      { name: 'brand', label: 'Who are they pretending to be?', placeholder: 'Bank, courier, tax dept…' },
      { name: 'link', label: 'Suspicious link inside (optional)', placeholder: 'http://…' },
    ],
    redFlags: [
      'Urgency: "account blocked in 24 hours"',
      'Sender domain doesn\'t match the real company',
      'Asks for OTP, PIN, CVV or passwords',
      'Generic greeting like "Dear Customer"',
    ],
  },
  website: {
    key: 'website',
    label: 'Fake Website',
    short: 'Websites',
    Icon: Globe,
    color: '#7c9cff',
    pitch: 'Look-alike shopping, banking, job or government sites built to collect payments or data.',
    identifier: { label: 'Website address', placeholder: 'mega-sale-offer.shop' },
    fields: [
      { name: 'brand', label: 'What does it imitate?', placeholder: 'Shopping site, bank, govt portal…' },
      {
        name: 'channel', label: 'Where did you find it?', type: 'select',
        options: ['SMS', 'WhatsApp', 'Social media ad', 'Email', 'Search result', 'Other'],
      },
    ],
    redFlags: [
      'Prices that are too good to be true',
      'Misspelled or extra-long domain names',
      'Only accepts UPI to a personal ID',
      'No real address, returns or contact page',
    ],
  },
  phone: {
    key: 'phone',
    label: 'Scam Phone Number',
    short: 'Numbers',
    Icon: PhoneCall,
    color: '#ffb020',
    pitch: 'Fraud calls, SMS or WhatsApp messages: fake police, courier, loan, job and lottery scams.',
    identifier: { label: 'Phone number', placeholder: '+91 98XXX XXXXX' },
    fields: [
      {
        name: 'channel', label: 'How did they contact you?', type: 'select',
        options: ['Call', 'SMS', 'WhatsApp', 'Telegram', 'Video call'],
      },
      { name: 'claim', label: 'Who did they claim to be?', placeholder: 'Police, courier, bank, recruiter…' },
    ],
    redFlags: [
      'Threats of arrest or "digital arrest"',
      'Asks you to install a screen-sharing app',
      'Pressure to stay on the call and tell no one',
      'Job offers paying for likes or reviews',
    ],
  },
  upi: {
    key: 'upi',
    label: 'Fake UPI Request',
    short: 'UPI',
    Icon: IndianRupee,
    color: '#2ee6c5',
    pitch: 'Collect requests, QR codes or payment links disguised as refunds, prizes or buyer payments.',
    identifier: { label: 'UPI ID that sent the request', placeholder: 'refund.support@okbank' },
    fields: [
      { name: 'amount', label: 'Amount requested (₹)', type: 'number', placeholder: '4999' },
      {
        name: 'pretext', label: 'What was the excuse?', type: 'select',
        options: ['Refund / cashback', 'Prize / lottery', 'Buying item on marketplace', 'Wrong transfer, send back', 'Bill / KYC payment', 'Other'],
      },
      { name: 'app', label: 'App it came through', placeholder: 'Any UPI app' },
    ],
    redFlags: [
      'You never enter a PIN to RECEIVE money',
      'Scanning a QR code is only for paying',
      '"Refund" arriving as a collect request',
      'Stranger says they sent money by mistake',
    ],
  },
  story: {
    key: 'story',
    label: 'Scam Story',
    short: 'Stories',
    Icon: MessageCircleHeart,
    color: '#c38bff',
    pitch: 'Share what happened to you, anonymously, so someone else recognises it in time.',
    fields: [
      { name: 'title', label: 'Title', placeholder: 'The "customs parcel" call that almost got me', required: true },
      {
        name: 'category', label: 'Type of scam', type: 'select',
        options: ['Impersonation', 'Fake bill / KYC', 'Job / task scam', 'Investment / trading', 'Shopping', 'Loan app', 'Romance / sextortion', 'Other'],
      },
      { name: 'amount', label: 'Money lost, if any (₹, optional)', type: 'number', placeholder: '0' },
    ],
    redFlags: [
      'Your name is never shown, you get a random alias',
      'Phone numbers & emails in stories are hidden automatically',
      'Skip personal details: account numbers, addresses',
      'Your story may save someone this week',
    ],
  },
};

// Where to also report officially. Community reports here don't reach the authorities on their own.
export const OFFICIAL_CHANNELS = {
  phishing: [
    { label: 'Email CERT-In', href: 'mailto:incident@cert-in.org.in', note: 'incident@cert-in.org.in' },
    { label: 'National Cybercrime Portal', href: 'https://cybercrime.gov.in/', note: 'cybercrime.gov.in' },
  ],
  website: [
    { label: 'National Cybercrime Portal', href: 'https://cybercrime.gov.in/', note: 'Report the site' },
    { label: 'Chakshu (Sanchar Saathi)', href: 'https://sancharsaathi.gov.in/sfc/', note: 'If the link came by SMS or WhatsApp' },
  ],
  phone: [
    { label: 'Chakshu (Sanchar Saathi)', href: 'https://sancharsaathi.gov.in/sfc/', note: 'Report calls, SMS & WhatsApp' },
    { label: 'Call 1930', href: 'tel:1930', note: 'If you lost money' },
  ],
  upi: [
    { label: 'Call 1930', href: 'tel:1930', note: 'Report within hours to freeze money' },
    { label: 'National Cybercrime Portal', href: 'https://cybercrime.gov.in/', note: 'File a complaint' },
  ],
  story: [
    { label: 'Call 1930', href: 'tel:1930', note: 'National cybercrime helpline' },
    { label: 'National Cybercrime Portal', href: 'https://cybercrime.gov.in/', note: 'File a complaint' },
  ],
};

export const REPORT_TYPES = ['phishing', 'website', 'phone', 'upi'];
