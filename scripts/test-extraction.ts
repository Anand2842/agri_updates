
import { BlogGenerator } from '../src/lib/blog-generator';

const sampleText = `🥭URGENT REQUIREMENT 🌟

🏢 Company Name: Vivasv Farms Pvt. Ltd., Bangalore

🌿✨ AGRI CREATORS ✨🌿
🚀Recruiting & Job Advertising🚀
24×7 Support | All-India Network | Trusted by Agri Professionals
🌐 Visit us:
www.agricreators.com
www.krishicareer.in

👩‍💼 Position: Manager & Supervisor

📌 Number of Vacancies: 4

🎓 Qualification:
• B.Sc / Diploma (Any discipline)

🗣 Languages Required:
• English & Tamil

🚹🚺 Gender:
• Male / Female

💼 Experience:
• Experienced & Freshers can apply

📍 Job Location:
• Hosur – Denkanikottai

💰 Salary:
• ₹20,000 – ₹30,000 per month

📞 Contact Details:
📧 Email: Farmteamsouth@wecommunities.in

Agri jobs | Krishi Career
Whatsapp group: https://chat.whatsapp.com/CZ3yyGEZoQN48KQoLJBVU1`;

console.log("Testing BlogGenerator extraction...");
const result = BlogGenerator.generate(sampleText);

console.log("Category:", result.category);
console.log("Job Details:", JSON.stringify(result.job_details, null, 2));

if (
    result.category === 'Jobs' &&
    result.job_details?.company?.includes('Vivasv Farms') &&
    result.job_details?.location?.includes('Hosur') &&
    result.job_details?.email === 'Farmteamsouth@wecommunities.in'
) {
    console.log("\n✅ SUCCESS: Job details extracted correctly.");
} else {
    console.error("\n❌ FAILURE: Extraction failed.");
    process.exit(1);
}
