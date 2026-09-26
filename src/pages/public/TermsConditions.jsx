import LegalPage from '../../components/common/LegalPage';

const termsSections = [
  { title: 'Use of the website', content: 'The TuitionSphere website provides information about academic programs, estimated fees, demo classes and related support. Users should provide accurate information and use the website only for lawful purposes.' },
  { title: 'Programs and availability', content: 'Course content, subjects, mentors, schedules and batch availability may change based on academic requirements and operational capacity. Final details should be confirmed before enrollment.' },
  { title: 'Demo classes', content: 'A demo request does not guarantee a specific mentor, date, time or admission. TuitionSphere will confirm availability using the contact details submitted by the user.' },
  { title: 'Fees and payments', content: 'Fees displayed on the website are planning estimates unless expressly confirmed otherwise. Final fees, inclusions, payment schedules, applicable taxes and refund conditions should be communicated before payment.' },
  { title: 'Portal access', content: 'Login credentials and portal access are intended for authorised users. Users are responsible for keeping credentials confidential and should report suspected unauthorised access promptly.' },
  { title: 'Learning materials', content: 'Website content, branding and learning resources may be protected by intellectual-property rights. They should not be copied, distributed or commercially reused without appropriate permission.' },
  { title: 'Responsible conduct', content: 'Users must not attempt to disrupt the website, access restricted areas without authorisation, submit harmful content or misuse communication and learning features.' },
  { title: 'Changes and contact', content: 'These terms may be updated as services and website features evolve. Continued use after an update indicates acceptance of the revised terms. Questions may be submitted through the Contact page.' },
];

function TermsConditions() {
  return <LegalPage eyebrow="Website Terms" title="Terms & Conditions" introduction="These terms describe the general conditions for using the TuitionSphere website and requesting its educational services." sections={termsSections} updatedOn="10 August 2026" />;
}

export default TermsConditions;
