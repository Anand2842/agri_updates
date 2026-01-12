import { polishContent } from '../src/lib/ai';
import fs from 'fs';
import path from 'path';

// Manually load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} else {
    console.warn("No .env.local found");
}

const input = `Job Alert
Hiring: Sales Executive at Name: The Coco Brothers
A new career opportunity has been released. Check details below.
Job Overview
Position
Sales Executive
Location
Coimbatore Candidates Only (Work From Home)
Experience
1 Year Experience or Fresher
Qualification
✅ BSc Agriculture / BSc Horticulture / Diploma in Agriculture or Horticulture ONLY
Description
🍎 URGENT REQUIREMENT 🌟 🏡 Work From Home 🏢 Company Name: The Coco Brothers 🌿✨ AGRI CREATORS ✨🌿 🚀 Recruiting & Job Advertising 🚀 24×7 Support | All-India Network | Trusted by Agri Professionals 🌐 Visit Us: www.agricreators.com www.krishicareer.in 👩‍💼 Position: Sales Executive 📌 Number of Vacancies: 3 🎓 Qualification: ✅ BSc Agriculture / BSc Horticulture / Diploma in Agriculture or Horticulture ONLY 🗣 Languages Required: Tamil, English, Kannada & Malayalam 🚺 Gender: Female 💼 Experience: 1 Year Experience or Fresher 🖥 Requirement: Own Laptop Mandatory 📍 Location: Coimbatore Candidates Only (Work From Home) 💰 Salary: ₹10,000 + Incentives ⭐ Preference: 👉 First preference will be given to married female candidates 📞 Contact Number: 7448527844 📧 Email ID: thennanthoppuvibes@gmail.com 🌱 Agri Jobs | Krishi Career 📲 WhatsApp Group: https://chat.whatsapp.com/CZ3yyGEZoQN48KQoLJBVU1
How to Apply
📧 thennanthoppuvibes@gmail.com
Mention "Agri Updates" when you apply to increase visibility.
Frequently Asked Questions
Is this a verified job? ▼We source jobs from trusted networks, but please verify directly with the employer before making payments or sharing sensitive documents.`;

async function main() {
    console.log("🧹 Testing Magic Polish Feature");
    console.log("================================\n");

    console.log("📝 Input Content:");
    console.log(input.substring(0, 200) + "...\n");

    console.log("⚙️  Processing with AI...\n");

    try {
        const result = await polishContent(input);

        console.log("✨ POLISHED OUTPUT:");
        console.log("==================");
        console.log(result);
        console.log("==================\n");

        // Analysis
        console.log("📊 ANALYSIS:");
        console.log("- Emojis removed:", !result.includes('🍎') && !result.includes('🌟'));
        console.log("- Has h2 headers:", result.includes('<h2>'));
        console.log("- Has strong tags:", result.includes('<strong>'));
        console.log("- Has summary table:", result.includes('<table>'));
        console.log("- Has bullet lists:", result.includes('<ul>'));

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
