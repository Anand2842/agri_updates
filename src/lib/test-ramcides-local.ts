
import { BlogGenerator } from './blog-generator';

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
    console.log('--- Testing Ramcides Extraction (Internal) ---');

    try {
        const result = await BlogGenerator.generate(input);
        console.log('Title:', result.title);
        // Note: GeneratedPost might not expose job_details directly if it's not in the public interface.
        // However, I know the internal structure usually populates content based on them.
        // I will log the extracted fields by parsing the content or just log the content.
        // Actually, I'll log the whole result object hoping standard logging shows properties.
        // Or I can just check the content string for specific values.

        console.log('--- Content Preview ---');
        console.log(result.content.substring(0, 1000));

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
