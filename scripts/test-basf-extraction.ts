
import { BlogGenerator } from '../src/lib/blog-generator';

const basfText = `Urgent Requirement BASF India Ltd Position :- FDO / Sr.FDO Location - Qualifications: Diploma, B.Sc (Agri), M.Sc Agri, MBA Experience: Minimum- 1 - 3 Years Interested candidate please send resumes on whats app/email before 12/01/25 Contact Shubham Mundhe (TM) 7276721699 Sadik Shikh 9834238304 Send a resumr on WhatsApp only`;

console.log("Testing BlogGenerator extraction for BASF...");
const result = BlogGenerator.generate(basfText);

console.log("Category:", result.category);
console.log("Job Details:", JSON.stringify(result.job_details, null, 2));
console.log("HTML Preview:", result.content.substring(0, 1000));

// Expectations
const expectedCompany = "BASF India Ltd";
const expectedLocation = "Not Specified"; // Should handle empty location gracefully
const expectedContact = "7276721699"; // Should catch at least one number

if (
    result.job_details?.company?.includes('BASF') &&
    !result.job_details?.location?.includes('Diploma') &&
    (result.content.includes('7276721699') || result.job_details?.company.includes('7276721699'))
) {
    console.log("\n✅ SUCCESS: Extraction improved.");
} else {
    console.error("\n❌ FAILURE: Extraction failed.");
    console.log(`Expected Company to include '${expectedCompany}', got '${result.job_details?.company}'`);
    console.log(`Expected Location to NOT be 'Diploma...', got '${result.job_details?.location}'`);
}
