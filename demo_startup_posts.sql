-- SQL Script to insert 5 demo Startup news posts
-- Please run this script in your Supabase SQL Editor

INSERT INTO posts (
    slug, 
    title, 
    excerpt, 
    content, 
    author_name, 
    category, 
    status, 
    image_url, 
    tags, 
    published_at
) VALUES 
(
    'harvestlink-raises-12m-funding',
    'HarvestLink Raises $12M to Automate Berry Harvesting',
    'Silicon Valley and Bengaluru-based HarvestLink has secured $12M in Series A funding to scale their AI-powered robotic pickers.',
    '<p>HarvestLink, a leading robotics startup, announced its $12 million Series A funding round to accelerate the deployment of its autonomous berry-picking robots across North America and India.</p><p>With rural labor shortages intensifying, HarvestLink''s AI-driven computer vision system allows for 24/7 harvesting without damaging delicate fruit.</p>',
    'Editorial Desk',
    'Startups',
    'published',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80',
    ARRAY['Funding', 'Robotics', 'AI'],
    NOW() - INTERVAL '1 hours'
),
(
    'terracarbon-ai-soil-health',
    'TerraCarbon AI: The New Standard in Soil Health Monitoring',
    'Launch today: TerraCarbon AI uses satellite imagery and ground sensors to provide real-time carbon sequestration data.',
    '<p>As the carbon credit market heats up, farmers need reliable ways to measure soil carbon. Enter TerraCarbon AI.</p><p>Combining multispectral satellite imagery with IoT ground sensors, the platform gives an exact read on soil nutrients and carbon density, empowering farmers to monetize regenerative practices.</p>',
    'Tech Reporter',
    'Startups',
    'published',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80',
    ARRAY['Launch', 'Sustainability', 'Carbon'],
    NOW() - INTERVAL '5 hours'
),
(
    'bayer-agri-techscale-partnership',
    'Bayer-Agri Partners with TechScale for Precision Spraying',
    'A strategic alliance between Bayer-Agri and TechScale aims to deploy ultra-precise spraying drones to 1 million hectares.',
    '<p>In a massive push towards precision agriculture, Bayer-Agri has announced a strategic partnership with drone manufacturer TechScale.</p><p>The goal is to cover 1 million hectares by 2027 using "swarm" drone technology that targets individual weeds, drastically reducing chemical runoff and input costs.</p>',
    'Industry News',
    'Startups',
    'published',
    'https://images.unsplash.com/photo-1558913959-1eac87eb49aa?auto=format&fit=crop&q=80',
    ARRAY['Partnership', 'Drones', 'Precision Ag'],
    NOW() - INTERVAL '12 hours'
),
(
    'aeroleaf-modular-vertical-farming',
    'AeroLeaf Unveils Modular Vertical Farming for Apartments',
    'AeroLeaf''s new modular units allow urban dwellers to grow over 50 types of crops in less than 2 square feet.',
    '<p>Bringing agriculture into the living room, AeroLeaf has unveiled its latest product line of high-end, modular hydroponic systems.</p><p>Designed to fit in luxury apartments, the system utilizes AI-calibrated LED spectrums to guarantee yields of herbs and leafy greens year-round.</p>',
    'Innovation Desk',
    'Startups',
    'published',
    'https://images.unsplash.com/photo-1530836369250-ef71a3f5e481?auto=format&fit=crop&q=80',
    ARRAY['Innovation', 'Vertical Farming', 'Urban Ag'],
    NOW() - INTERVAL '1 days'
),
(
    'cropsense-acquires-smartwater',
    'CropSense Acquires SmartWater Systems to Expand IoT Reach',
    'CropSense has acquired SmartWater Systems for an undisclosed sum, integrating advanced flow-meters into their platform.',
    '<p>Consolidation continues in the AgTech space as data giant CropSense acquired irrigation monitor SmartWater Systems.</p><p>The integration of SmartWater''s patented digital flow-meters into the CropSense dashboard will allow growers to manage water application with unprecedented accuracy in drought-prone regions.</p>',
    'Market Watch',
    'Startups',
    'published',
    'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80',
    ARRAY['Acquisition', 'IoT', 'Irrigation'],
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (slug)
DO UPDATE SET
    image_url = EXCLUDED.image_url,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    tags = EXCLUDED.tags;
