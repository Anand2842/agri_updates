-- Seed Data for Agri Updates
-- Run this in the Supabase SQL Editor to populate your database

-- 1. Insert Jobs (News Style)
INSERT INTO jobs (title, company, location, type, salary_range, application_link, description, tags, is_active)
VALUES
(
    'Senior Agronomist - Research Lead',
    'Green Horizon Labs',
    'Davis, CA',
    'Full-time',
    '$95,000 - $130,000',
    'mailto:careers@greenhorizon.com',
    'Leading a team of researchers to develop drought-resistant crop varieties. Requires PhD in Agronomy and 5+ years experience.',
    ARRAY['Research', 'Agronomy', 'Senior'],
    true
),
(
    'Precision Agriculture Specialist',
    'DroneAg Tech',
    'Austin, TX',
    'Contract',
    '$50/hr',
    'https://example.com/apply/drone-specialist',
    'Operate and maintain agricultural drones for field mapping and crop health analysis. Part 107 license required.',
    ARRAY['Drone', 'Technology', 'Contract'],
    true
),
(
    'Farm Operations Manager',
    'Valley Organic Farms',
    'Fresno, CA',
    'Full-time',
    '$70,000 - $90,000',
    'mailto:hr@valleyorganic.com',
    'Oversee daily operations of a 500-acre organic vegetable farm. Experience with organic certification processes is a plus.',
    ARRAY['Management', 'Organic', 'Operations'],
    true
),
(
    'Agri-FinTech Developer',
    'CropCapital',
    'Remote',
    'Full-time',
    '$120,000 - $160,000',
    'https://example.com/apply/developer',
    'Full-stack developer needed to build financial tools for farmers. React and Node.js experience required.',
    ARRAY['Tech', 'Remote', 'Finance'],
    true
),
(
    'Sustainable Agriculture Intern',
    'EcoFarm Institute',
    'Vermont, USA',
    'Internship',
    '$20/hr',
    'mailto:internships@ecofarm.org',
    'Summer internship focusing on regenerative farming practices and soil health monitoring.',
    ARRAY['Internship', 'Sustainability', 'Entry Level'],
    true
);

-- 2. Insert Startups
INSERT INTO startups (name, description, funding_stage, location, website_url, tags)
VALUES
(
    'FarmBotics',
    'Autonomous weeding robots using computer vision to reduce herbicide usage.',
    'Series A',
    'San Francisco, CA',
    'https://farmbotics.example.com',
    ARRAY['Robotics', 'AI', 'Sustainability']
),
(
    'AgriChain',
    'Blockchain-based supply chain transparency platform for organic producers.',
    'Seed',
    'London, UK',
    'https://agrichain.example.com',
    ARRAY['Blockchain', 'Supply Chain', 'Software']
),
(
    'Vertical Harvest',
    'High-density vertical farming solutions for urban environments.',
    'Series B',
    'New York, NY',
    'https://verticalharvest.example.com',
    ARRAY['Vertical Farming', 'Urban Ag', 'Hydroponics']
);

-- 3. Insert Posts
INSERT INTO posts (slug, title, excerpt, content, author_name, category, published_at)
VALUES
(
    'future-of-ai-agriculture',
    'The Future of AI in Agriculture: 2026 and Beyond',
    'Artificial Intelligence is transforming how we farm, from predictive analytics to autonomous harvest.',
    '<p>Artificial Intelligence is rapidly becoming the backbone of modern agriculture. From <strong>autonomous tractors</strong> to <em>predictive pest modeling</em>, AI tools are helping farmers make data-driven decisions that increase yield and reduce waste.</p><p>In 2026, we expect to see...</p>',
    'Sarah Jenkins',
    'Technology',
    NOW() - INTERVAL '2 days'
),
(
    'sustainable-farming-trends',
    'Top 5 Sustainable Farming Trends to Watch',
    'Regenerative agriculture and cover cropping are gaining massive momentum worldwide.',
    '<p>As climate change poses new challenges, farmers are turning to ancient practices combined with modern tech. <strong>Regenerative agriculture</strong> focuses on soil health as the primary key to sustainability.</p>',
    'Mike Chen',
    'Analysis',
    NOW() - INTERVAL '5 days'
),
(
    'agritech-investment-report-q4',
    'AgriTech Investment Report: Q4 2025 Highlights',
    'Venture capital funding in the agritech sector sees a 15% rebound led by robotics startups.',
    '<p>Despite a slow start to the year, Q4 2025 finished strong for AgriTech investments. Robotics and automation companies led the pack, securing over $500M in funding globally.</p>',
    'Market Watch Team',
    'Startups',
    NOW() - INTERVAL '10 days'
);
