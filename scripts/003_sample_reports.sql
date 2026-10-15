-- SatarkSetu · 003_sample_reports.sql (OPTIONAL — demo data)
-- Illustrative reports only. Every identifier is a reserved placeholder (.example domains,
-- 90000000xx numbers, @okdemo UPI handles) — these are NOT real scammers.
-- Rows are marked demo = 1 so the app labels them "Sample". Skip this file for a real deployment.
BEGIN;

INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '12079370-21d2-4aa8-823e-8d985240b3b7', 'phishing', 'kyc-desk@account-verify.example', 'kyc-desk@account-verify.example', NULL,
  'Email says my bank KYC has expired and asks me to click a link and enter card details and OTP. The sender domain is not the bank domain.',
  '{"brand": "Bank", "subject": "URGENT: Your account will be blocked in 24 hours", "link": "http://account-verify.example/kyc"}', NULL, NULL, 14, 0, 'published', 1, '2026-09-17T14:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '8ef6f9c9-b66b-4112-9757-acdb3d618f7c', 'website', 'https://mega-festive-sale.example', 'mega-festive-sale.example', NULL,
  'Instagram ad showing iPhones at 90% off. Checkout only accepts UPI to a personal ID and the order never ships. No contact address anywhere.',
  '{"brand": "Shopping", "channel": "Social media ad"}', NULL, NULL, 22, 0, 'published', 1, '2026-09-17T10:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '94fe399f-8113-46a1-9b7c-8f63fe6dc889', 'phone', '+91 90000 00001', '9000000001', NULL,
  'Caller said a parcel in my name contained illegal items and transferred me to a fake "police officer" on video call demanding money to avoid arrest.',
  '{"channel": "Call", "claim": "Courier / customs officer"}', NULL, NULL, 31, 0, 'published', 1, '2026-09-17T06:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '8e01575f-ab74-4d84-9dba-fd6d5f0b415a', 'upi', 'refund.helpdesk@okdemo', 'refund.helpdesk@okdemo', NULL,
  'Got a collect request titled "Refund approved". Accepting a collect request and entering your PIN SENDS money. You never need a PIN to receive.',
  '{"app": "Any UPI app", "pretext": "Refund / cashback"}', 4999, NULL, 18, 0, 'published', 1, '2026-09-16T21:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '53d5aad2-467f-41d9-884d-396e64970c53', 'phone', '+91 90000 00002', '9000000002', NULL,
  'WhatsApp message offering Rs 5,000/day for liking YouTube videos. After a few small payouts they ask you to "invest" in tasks and never pay back.',
  '{"channel": "WhatsApp", "claim": "Part-time job recruiter"}', NULL, NULL, 9, 0, 'published', 1, '2026-09-16T13:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '7643504d-bc81-4d8a-87b6-378137d807fb', 'phishing', 'rewards@points-expiry.example', 'rewards@points-expiry.example', NULL,
  'Asks to redeem points by entering full card number, expiry and CVV on a look-alike page.',
  '{"brand": "Credit card rewards", "subject": "Your 7,850 reward points expire today", "link": "http://points-expiry.example"}', NULL, NULL, 6, 0, 'published', 1, '2026-09-16T01:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  'b703fd31-8842-40f8-bb7b-5d191ed20976', 'upi', 'army.officer.olx@okdemo', 'army.officer.olx@okdemo', NULL,
  'Buyer claiming to be in the army wanted my used sofa and sent a QR code "to receive payment". Scanning a QR code is only for paying, never for receiving.',
  '{"app": "Any UPI app", "pretext": "Buying item on marketplace"}', 15000, NULL, 12, 0, 'published', 1, '2026-09-15T13:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  '95e9fa2e-d3fb-419c-8f2c-3d56e752ec75', 'website', 'electricity-bill-update.example', 'electricity-bill-update.example', NULL,
  'SMS: "Your power will be disconnected tonight, update bill". Link opens a page that asks to install a remote access app.',
  '{"brand": "Electricity board", "channel": "SMS"}', NULL, NULL, 16, 0, 'published', 1, '2026-09-14T19:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  'b8b6ea25-1809-4f2f-85ca-a6d3949fe279', 'story', NULL, NULL, 'I almost lost my savings to a "digital arrest"',
  'They kept me on video call for three hours, showed fake ID cards and a fake police station background, and told me not to tell anyone. What saved me was my sister walking into the room. She hung up the call. Real police never ask you to stay on a video call or transfer money to "verify" it.',
  '{"category": "Impersonation", "lesson": "Hang up. No government agency does a \"digital arrest\". Talk to someone you trust immediately."}', NULL, 'Watchful Heron #284', 41, 0, 'published', 1, '2026-09-17T12:55:22.725Z'
);
INSERT OR IGNORE INTO reports (id, type, identifier, normalized, title, description, details, amount, alias, confirmations, flags, status, demo, created_at) VALUES (
  'f6f21ba1-9dc7-4705-9c7b-2f741dfead23', 'story', NULL, NULL, 'The electricity bill SMS cost me Rs 38,000',
  'I got an SMS late at night saying my power would be cut. The number they gave asked me to install a "support app" to pay the pending bill. The app gave them control of my phone and they emptied my account while I was on the call. I reported on 1930 within the hour and part of the amount was frozen.',
  '{"category": "Fake bill / KYC", "lesson": "Never install apps someone asks you to on a call. Report to 1930 fast, speed matters."}', 38000, 'Steady Otter #517', 27, 0, 'published', 1, '2026-09-16T11:55:22.725Z'
);

COMMIT;
