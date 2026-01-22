const { JSDOM } = require('jsdom');

async function testFrontend() {
    console.log('Testing frontend wireup (localhost:3000)...');
    try {
        // Attempt to fetch the home page
        const res = await fetch('http://localhost:3000');
        if (!res.ok) {
            throw new Error(`Failed to fetch home page: ${res.status} ${res.statusText}`);
        }

        const html = await res.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Basic connectivity check
        const title = doc.querySelector('title')?.textContent;
        console.log('Page Title:', title);

        if (!title) {
            console.warn('Warning: No <title> tag found. Page might be empty.');
        } else {
            console.log('Frontend connectivity: OK');
        }

        // Check for some content that implies data fetching. 
        // Since I don't know the exact class names without looking at the code, 
        // I'll look for general indicators or just success of the fetch.
        // Ideally, we'd check for a known blog post title if we had one.
        // For now, checking that the body is not empty is a good start.
        const bodyText = doc.body.textContent;
        if (bodyText.length < 100) {
            console.warn('Warning: Body content seems very short. SSR/SSG might have failed or is loading.');
        } else {
            console.log('Frontend content detected (body length > 100 chars).');
        }

    } catch (err) {
        console.error('Frontend test failed:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
        console.log('Make sure the dev server is running (npm run dev).');
        process.exit(1);
    }
}

testFrontend();
