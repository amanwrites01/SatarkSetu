-- SatarkSetu · 002_advisories.sql
-- Reference data: official advisories published by Government of India bodies, and
-- national figures on suspected fraud communications reported via DoT's Chakshu facility.
-- Safe to re-run: existing rows are replaced.
BEGIN;

INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'mha-digital-arrest-2024', 'phone', '"Digital arrest" by criminals posing as Police, CBI, NCB, RBI or ED', 'Ministry of Home Affairs · I4C', '2024-05-14',
  'Fraudsters call saying a parcel sent to or by you contains drugs, fake passports or other contraband, or that a relative is in custody, and demand money to "settle the case". Victims are kept on Skype or other video calls in a so-called "digital arrest" until they pay. The callers use studios made to look like police stations and government offices and wear uniforms. MHA says this is run by cross-border crime syndicates.',
  '["No police or government agency arrests anyone over a video call.", "Do not transfer money to \"compromise\" a case. Hang up.", "Report immediately on 1930 or cybercrime.gov.in."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2020570', 'https://cybercrime.gov.in/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'trai-impersonation-2025', 'phone', 'Calls and messages impersonating TRAI threatening to disconnect your number', 'Telecom Regulatory Authority of India', '2025-04-07',
  'Fraudsters posing as TRAI officials threaten to disconnect your mobile connection for "illegal activities" to extract money. TRAI does not contact customers about disconnecting mobile numbers through calls, messages or otherwise, and has not authorised any third-party agency to do so. Disconnections for billing, KYC or misuse are done only by your telecom operator.',
  '["Treat any \"TRAI\" call or notice threatening disconnection as fraud.", "Cross-check with your telecom operator''s official customer care.", "Report the call on Chakshu at sancharsaathi.gov.in/sfc."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2119782', 'https://sancharsaathi.gov.in/sfc/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'dot-impersonation-2024', 'phone', 'Calls in the name of DoT and foreign-number WhatsApp calls impersonating officials', 'Department of Telecommunications', '2024-03-29',
  'Callers claiming to be from DoT threaten that all your mobile numbers will be disconnected or are being misused in illegal activity. DoT also warned about WhatsApp calls from foreign numbers (for example +92-xxxxxxxxxx) impersonating government officials. DoT does not authorise anyone to make such calls.',
  '["Do not share any personal information on such calls.", "Check the SIMs issued in your name on Sanchar Saathi''s \"Know Your Mobile Connections\".", "Report the call on Chakshu. If you already lost money, call 1930."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2016613', 'https://sancharsaathi.gov.in/sfc/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'i4c-booking-scams-2025', 'website', 'Fake booking websites for pilgrimages, helicopters, hotels and taxis', 'Ministry of Home Affairs · I4C', '2025-04-19',
  'Professional-looking fake websites, social media pages, WhatsApp accounts and paid search ads offer Kedarnath helicopter bookings, Char Dham guest houses and hotels, cab services and religious tour packages. After paying, victims get no confirmation and the contact numbers stop working.',
  '["Book Kedarnath helicopters only on heliyatra.irctc.co.in.", "Be careful with \"sponsored\" results and unknown links on Google, Facebook or WhatsApp.", "Use official government portals or trusted travel agents, and report fake sites on cybercrime.gov.in."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2122832', 'https://cybercrime.gov.in/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'i4c-mule-accounts-2024', 'upi', 'Illegal payment gateways built on rented "mule" bank accounts', 'Ministry of Home Affairs · I4C', '2024-10-28',
  'Criminals recruit people on Telegram and Facebook to rent out their current or savings accounts. The accounts are controlled remotely from overseas and turned into illegal payment gateways that collect money for fake investment sites, offshore betting and fake stock-trading platforms. I4C named gateways including PeacePay, RTX Pay, PoccoPay and RPPay.',
  '["Never sell, rent or \"lend\" your bank account, UPI ID or SIM. You can be held liable.", "Be wary of paying into an unknown gateway for trading or gaming apps.", "Report account-rental offers on cybercrime.gov.in."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2069000', 'https://cybercrime.gov.in/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'rbi-cyber-frauds-2022', 'upi', 'Fake UPI collect requests, remote-access apps and fake bank helplines', 'Reserve Bank of India', '2022-01-28',
  'RBI warns that fraudsters misuse the UPI "collect request" feature by sending fake payment requests with messages like "Enter your UPI PIN to receive money". Other common methods: vishing calls about KYC updates or unblocking accounts, phishing emails and SMS with links, getting you to install remote-access apps, and fake bank or wallet helpline numbers shown on web pages and search results.',
  '["You never need to enter your UPI PIN to receive money.", "Never install an app because a caller asks you to.", "Take customer care numbers only from the official website or app."]', 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185', 'https://cybercrime.gov.in/'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'rbi-phishing-2022', 'phishing', 'Spoofed bank and wallet emails and SMS asking for OTP, PIN or CVV', 'Reserve Bank of India', '2022-01-28',
  'Spoofed emails and SMS are designed to look like they came from your bank or e-wallet and contain links that collect your user ID, passwords, OTP, card PIN, CVV and expiry date. RBI cautions the public about fraudulent messages, unknown links, false notifications and unauthorised QR codes.',
  '["Banks never ask for your OTP, PIN, CVV or password.", "Check the sender domain and do not click links in unexpected messages.", "Report phishing to CERT-In at incident@cert-in.org.in."]', 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=53185', 'mailto:incident@cert-in.org.in'
);
INSERT OR REPLACE INTO advisories (id, type, title, issuer, published, summary, tips, source_url, report_url) VALUES (
  'indiapost-fake-surveys-2022', 'website', 'Fake India Post "survey", "quiz" and "lucky draw" links promising subsidies or prizes', 'India Post · Ministry of Communications', '2022-04-23',
  'Short links circulating on WhatsApp, Telegram, Instagram, email and SMS claim India Post is giving government subsidies, bonuses or prizes through surveys and quizzes, including a fake "170th anniversary lucky draw". India Post is not involved in any such activity, and PIB Fact Check has declared these sites fake.',
  '["Do not open short links promising prizes or subsidies.", "Never share date of birth, account numbers, mobile number or OTP on such pages.", "Report the link on cybercrime.gov.in or Chakshu."]', 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1819189', 'https://sancharsaathi.gov.in/sfc/'
);

-- Source: Department of Telecommunications, Chakshu (Sanchar Saathi) — PIB, 2026-02-05
-- https://www.pib.gov.in/PressReleasePage.aspx?PRID=2223779
-- Note: 2026 figures are partial (reported in early February 2026).
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Any other suspected fraud', 2024, 51593);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Any other suspected fraud', 2025, 119164);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Any other suspected fraud', 2026, 8540);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('KYC / bank / electricity / gas / insurance payment', 2024, 21281);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('KYC / bank / electricity / gas / insurance payment', 2025, 106483);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('KYC / bank / electricity / gas / insurance payment', 2026, 8325);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Fake customer care helpline', 2024, 30969);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Fake customer care helpline', 2025, 60985);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Fake customer care helpline', 2026, 4519);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Online job / lottery / gift / loan offers', 2024, 23634);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Online job / lottery / gift / loan offers', 2025, 58560);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Online job / lottery / gift / loan offers', 2026, 4591);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as Police, CBI, Customs, Aadhaar, RBI', 2024, 44865);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as Police, CBI, Customs, Aadhaar, RBI', 2025, 54639);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as Police, CBI, Customs, Aadhaar, RBI', 2026, 6675);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Investment, stock market and trading', 2024, 165);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Investment, stock market and trading', 2025, 29140);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Investment, stock market and trading', 2026, 2112);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Sextortion', 2024, 10901);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Sextortion', 2025, 21189);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Sextortion', 2026, 1774);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as a relative / friend', 2024, 258);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as a relative / friend', 2025, 19564);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as a relative / friend', 2026, 1201);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Malicious link / website', 2024, 8304);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Malicious link / website', 2025, 19418);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Malicious link / website', 2026, 2933);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as DoT / TRAI', 2024, 217);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as DoT / TRAI', 2025, 15595);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('Impersonation as DoT / TRAI', 2026, 809);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('IVR / robo calls', 2024, 16037);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('IVR / robo calls', 2025, 14925);
INSERT OR REPLACE INTO national_stats (category, year, count) VALUES ('IVR / robo calls', 2026, 1376);

COMMIT;
