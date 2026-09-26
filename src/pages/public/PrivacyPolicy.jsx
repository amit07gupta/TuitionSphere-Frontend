import LegalPage from '../../components/common/LegalPage';

const privacySections = [
  { title: 'Information we collect', content: 'We may collect details submitted through inquiry, demo-booking and login forms, including names, contact information, student grade, education board, preferred subjects and scheduling preferences.' },
  { title: 'How information is used', content: 'Submitted information may be used to respond to inquiries, arrange demo classes, recommend suitable programs, communicate academic updates and support enrollment or portal access.' },
  { title: 'Information sharing', content: 'We do not sell personal information. Information may be shared with authorised staff or service providers only when reasonably necessary to deliver requested services, operate the website or meet legal obligations.' },
  { title: 'Student and parent information', content: 'Student-related information should be submitted by a parent, guardian or authorised individual. We aim to use such information only for legitimate educational guidance and service delivery.' },
  { title: 'Storage and security', content: 'Reasonable administrative and technical measures should be used to protect collected information. No internet-based system can guarantee absolute security, and retention periods may depend on operational and legal requirements.' },
  { title: 'Cookies and website data', content: 'The website may use essential browser storage or similar technologies for features such as sessions, preferences and basic performance monitoring. Additional analytics should be disclosed when introduced.' },
  { title: 'Your choices', content: 'You may contact TuitionSphere to request correction or deletion of personal information, subject to applicable legal, security and record-keeping requirements.' },
  { title: 'Policy updates', content: 'This policy may be updated when website features, services or information-handling practices change. The latest revision date will be displayed on this page.' },
];

function PrivacyPolicy() {
  return <LegalPage eyebrow="Legal & Privacy" title="Privacy Policy" introduction="This page explains how information submitted through the TuitionSphere website may be collected, used and protected." sections={privacySections} updatedOn="10 August 2026" />;
}

export default PrivacyPolicy;
