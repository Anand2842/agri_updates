
import { BlogGenerator } from '../src/lib/blog-generator';

const input = `Job Alert
Hiring: SALES OFFICER/TERRITORY MANAGER at looking for Sales Marketing Professionals.
A new career opportunity has been released. Check details below.
Job Overview
Position
SALES OFFICER/TERRITORY MANAGER
Location
# Yavatmal- Covering whole district .
Experience
For SO/TM : Minimum 4 to 5year's in Same area/ Territory
Qualification
B.Sc.Agri./ M. Sc Agri. from Authorised Govt. Agriculture University.
Description
*. Job Opportunity* Excellent opportunity in a Well Reputed Nutrition, Liquid Fertilizer and Agrochemical Company looking for Sales Marketing Professionals. URGENT REQUIREMENT - Organization : *Ramcides crops science pvt Ltd.* Chennai POSITION - SALES OFFICER/TERRITORY MANAGER LOCATION - # Yavatmal- Covering whole district . Experience For SO/TM : Minimum 4 to 5year's in Same area/ Territory on Company Payroll in Pesticides Company will be essential Requirement.. Salary : As Per Industry Standard. Age Limit - 30 - 35 Years. Minimum Qualification : B.Sc.Agri./ M. Sc Agri. from Authorised Govt. Agriculture University. Note : Do not apply fresher candidate . Interested Candidate can send their Latest Resume before 15 Jan 2026. https://tinyurl.com/AGRICULTURE365 shivshankar.ambhore@ramcides.com shankuambhore@yahoo.com
How to Apply
📧 shivshankar.ambhore@ramcides.com
Mention "Agri Updates" when you apply to increase visibility.`;

async function run() {
    console.log('--- Testing Ramcides Extraction ---');
    // We mock the AI response to be empty or generic to force fallback, 
    // since we want to test the regex fallback logic which is likely where the issue lies.
    // However, I can't easily mock the AI call inside BlogGenerator without modifying it.
    // But wait, BlogGenerator.generate() calls polishContent().
    // If I run this, it will call the actual AI (OpenRouter/Xiaomi).
    // I should check what the ACTUAL AI returns too.

    try {
        const result = await BlogGenerator.generate(input);
        console.log('Title:', result.title);
        console.log('Company:', result.job_details?.company);
        console.log('Location:', result.job_details?.location);
        console.log('Position:', result.title); // Title is mapped to position in the return object

        // Check generated content for extracted fields
        // The GeneratedPost interface doesn't strictly have job_details property in the return type of generate(),
        // it returns GeneratedPost which has content.
        // Wait, let's check BlogGenerator.generate signature.

        console.log('--- Content Preview ---');
        console.log(result.content.substring(0, 500));

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
