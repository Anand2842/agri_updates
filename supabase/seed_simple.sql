-- Simplified Seed Data for Agri Updates
-- This version avoids schema conflicts with ENUM types
-- Run this in the Supabase SQL Editor

-- 1. Insert Jobs (these are the most important for your site)
INSERT INTO jobs (title, company, location, type, salary_range, application_link, description, tags, is_active)
VALUES
(
    'Senior Agronomist - Research Lead',
    'Green Horizon Labs',
    'Bangalore, India',
    'Full-time',
    '₹12,00,000 - ₹18,00,000',
    'mailto:careers@greenhorizon.com',
    'Leading a team of researchers to develop drought-resistant crop varieties. Requires PhD in Agronomy and 5+ years experience.',
    ARRAY['Research', 'Agronomy', 'Senior'],
    true
),
(
    'Precision Agriculture Specialist',
    'DroneAg Tech',
    'Hyderabad, India',
    'Contract',
    '₹4,000/hr',
    'https://example.com/apply/drone-specialist',
    'Operate and maintain agricultural drones for field mapping and crop health analysis. Drone license required.',
    ARRAY['Drone', 'Technology', 'Contract'],
    true
),
(
    'Farm Operations Manager',
    'Valley Organic Farms',
    'Pune, India',
    'Full-time',
    '₹8,00,000 - ₹12,00,000',
    'mailto:hr@valleyorganic.com',
    'Oversee daily operations of a 500-acre organic vegetable farm. Experience with organic certification processes is a plus.',
    ARRAY['Management', 'Organic', 'Operations'],
    true
),
(
    'AgriTech Software Developer',
    'CropCapital',
    'Remote (India)',
    'Full-time',
    '₹15,00,000 - ₹22,00,000',
    'https://example.com/apply/developer',
    'Full-stack developer needed to build financial tools for farmers. React and Node.js experience required.',
    ARRAY['Tech', 'Remote', 'Finance'],
    true
),
(
    'Sustainable Agriculture Intern',
    'EcoFarm Institute',
    'Chennai, India',
    'Internship',
    '₹15,000/month',
    'mailto:internships@ecofarm.org',
    'Summer internship focusing on regenerative farming practices and soil health monitoring.',
    ARRAY['Internship', 'Sustainability', 'Entry Level'],
    true
);

-- 2. Insert Posts (Blog/News articles)
INSERT INTO posts (slug, title, excerpt, content, author_name, category, published_at)
VALUES
(
    'future-of-ai-agriculture',
    'The Future of AI in Agriculture: 2026 and Beyond',
    'Artificial Intelligence is transforming how we farm, from predictive analytics to autonomous harvest.',
    '<p>Artificial Intelligence is rapidly becoming the backbone of modern agriculture. From <strong>autonomous tractors</strong> to <em>predictive pest modeling</em>, AI tools are helping farmers make data-driven decisions that increase yield and reduce waste.</p><p>In 2026, we expect to see widespread adoption of computer vision for crop monitoring and machine learning models that can predict optimal planting times with unprecedented accuracy.</p>',
    'Sarah Jenkins',
    'Technology',
    NOW() - INTERVAL '2 days'
),
(
    'sustainable-farming-trends',
    'Top 5 Sustainable Farming Trends to Watch in India',
    'Regenerative agriculture and cover cropping are gaining massive momentum across Indian farms.',
    '<p>As climate change poses new challenges, Indian farmers are turning to ancient practices combined with modern tech. <strong>Regenerative agriculture</strong> focuses on soil health as the primary key to sustainability.</p><p>From Punjab to Tamil Nadu, farmers are adopting no-till farming, cover cropping, and integrated pest management.</p>',
    'Rahul Sharma',
    'Analysis',
    NOW() - INTERVAL '5 days'
),
(
    'agritech-investment-report-q4',
    'AgriTech Investment Report: Q4 2025 Highlights for India',
    'Venture capital funding in the Indian agritech sector sees a 25% growth led by farm-to-fork startups.',
    '<p>Despite global economic headwinds, Q4 2025 finished strong for Indian AgriTech investments. Farm-to-fork supply chain startups led the pack, securing over ₹2,000 crore in funding.</p><p>Key areas of investment include cold storage solutions, agricultural AI, and farmer credit platforms.</p>',
    'Market Watch Team',
    'Startups',
    NOW() - INTERVAL '10 days'
);

-- 3. Verify data was inserted
SELECT 'Jobs inserted:' as info, COUNT(*) as count FROM jobs;
SELECT 'Posts inserted:' as info, COUNT(*) as count FROM posts;
