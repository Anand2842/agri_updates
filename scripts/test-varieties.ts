import { BlogGenerator } from '../src/lib/blog-generator';

const samples = [
    {
        id: 1,
        name: "Standard Bullet Points",
        text: `Hiring: Agronomist at GreenField Corp
Location: Pune, Maharashtra
Experience: 2-4 Years
Qualification: B.Sc Agriculture
Contact: 9876543210
Send CV to hr@greenfield.com`
    },
    {
        id: 2,
        name: "Messy Forward (BASF Style)",
        text: `Urgent Requirement BASF India Ltd Position :- FDO / Sr.FDO Location - Qualifications: Diploma, B.Sc (Agri), M.Sc Agri, MBA Experience: Minimum- 1 - 3 Years Interested candidate please send resumes on whats app/email before 12/01/25 Contact Shubham Mundhe (TM) 7276721699 Sadik Shikh 9834238304 Send a resumr on WhatsApp only`
    },
    {
        id: 3,
        name: "Paragraph Style",
        text: `We are looking for a Sales Manager for our Mumbai branch. The company is AgroStar. Candidates should have an MBA in Agribusiness and at least 5 years of experience. Interested folks can email resume@agrostar.in or call +91-9988776655.`
    },
    {
        id: 4,
        name: "Minimalist",
        text: `Role: Field Officer
Org: Mahyco
Exp: Freshers
Loc: Jalna
Call 8888888888`
    },
    {
        id: 5,
        name: "Implicit Company (Header)",
        text: `GrowIt India Pvt Ltd introduces a new vacancy.
Post: Regional Manager
HQ: Delhi
Degree: M.Sc Horticulture
Apply today.`
    },
    {
        id: 6,
        name: "Urgent Requirement Header",
        text: `URGENT OPENING
Company: Syngenta
Position: Territory Manager
Location: Hyderabad
Deep understanding of crop protection required.
Whatsapp CV to 9123456780`
    },
    {
        id: 7,
        name: "Mixed Separators",
        text: `Hiring For - Supply Chain Executive
Organization -> BigBasket
Location: Bangalore / Mysore
Experience * 3 years
Qualification: Any Graduate
Email: careers@bigbasket.com`
    },
    {
        id: 8,
        name: "Hidden Phone Pattern",
        text: `Organic India is hiring.
Role: Quality Analyst. Experience 1 year. Location Lucknow.
Call Mr. Sharma on 9822334455 for more info. Don't call after 6 PM.`
    },
    {
        id: 9,
        name: "No Explicit Keywords (Hard)",
        text: `Vacancy at Coromandel International.
Looking ofr Marketing Officer in Guntur.
B.Sc Agri must.
Send resume to 9999900000.`
    },
    {
        id: 10,
        name: "Multiple Emails/Contacts",
        text: `Hiring Area Manager @ DeHaat
Loc: Patna
Exp: 5+ Years
Send CV: hr@dehaat.com or jobs@dehaat.com
Call: 7777777777 / 8888888888`
    }
];

async function runTests() {
    console.log("Starting 10-Variety Stress Test for BlogGenerator...\n");

    let passed = 0;

    for (const sample of samples) {
        console.log(`--- Test ${sample.id}: ${sample.name} ---`);
        console.log(`INPUT: ${sample.text.substring(0, 50)}...`);

        try {
            // Mock the processing
            const lines = sample.text.split('\n').filter(line => line.trim() !== '');
            // @ts-ignore - accessing private static method for testing involves casting or public wrapper. 
            // Since generateJobPost is private, we'll use the public entry point 'generate' and assume it detects 'Jobs' category
            // However, 'generate' requires an API call to Gemini often? No, let's check BlogGenerator structure.
            // BlogGenerator.generate() calls specific methods.
            // Actually, looking at the code, generateJobPost is private. 
            // We will access it via 'generate' if we can force the type, OR better, since we are in a script, 
            // we can use the 'any' cast to access the private method.

            const result = (BlogGenerator as any).generateJobPost(sample.text, lines);

            console.log("EXTRACTED:");
            console.log(`  Company: ${result.job_details?.company}`);
            console.log(`  Location: ${result.job_details?.location}`);
            console.log(`  Position: ${result.title.split('Hiring: ')[1]?.split(' at')[0]}`); // Reverse engineer title for quick check
            console.log(`  Contact: ${result.job_details?.contact}`);

            // Verify HTML Table presence
            const hasTable = result.content.includes('<table');
            const hasCleanDescription = !result.content.includes(`<p>${sample.text}</p>`); // Should not just be raw text

            console.log(`  Format Check: Table Present? ${hasTable ? 'YES' : 'NO'}`);
            console.log("\n");
            passed++;
        } catch (e) {
            console.error(`  FAILED: ${e}`);
        }
    }

    console.log(`\nCompleted. Processed ${passed}/${samples.length} samples.`);
}

runTests();
