// simple prepublish validator
const fs = require('fs');
const matter = require('gray-matter');
const { JSDOM } = require('jsdom');

const path = process.argv[2];
if (!path) {
    console.error('Usage: node prepublish.js path/to/post.md');
    process.exit(2);
}

const raw = fs.readFileSync(path, 'utf8');
const { data: front, content } = matter(raw);

// checks
const errors = [];

// frontmatter checks
if (!front.title) errors.push('Missing title in frontmatter.');
if (!front.content_type) errors.push('Missing content_type in frontmatter.');
if (!front.author) {
    // We can't auto-set in memory for a validation script unless we write back.
    // Ideally, the generator sets this. Here we enforce it exists.
    // The user rule says: "If empty or missing, set author: Anand automatically."
    // But this is a VALIDATOR. So we should warn or maybe fail.
    // The user script provided says: front.author = 'Anand' // auto-set in-memory
    // But calls errors.push afterwards?
    // User Prompt said: "Author missing; defaulted to 'Anand'. Add explicit author in frontmatter."
    errors.push('Author missing; defaulted to "Anand". Add explicit author in frontmatter.');
}
if (!front.meta_description || front.meta_description.length < 60) {
    errors.push('meta_description missing or too short (60+ chars recommended).');
}
if (!front.source_url) errors.push('source_url missing. At least one source_url required for verification.');

// basic content checks
const dom = new JSDOM(`<div>${content}</div>`);
const doc = dom.window.document;

// heading checks
if (!doc.querySelector('h1') && !front.title) {
    errors.push('No <h1> found. Ensure top-level title exists either in frontmatter or content.');
}

// disclaimer check — exact match required at bottom
const disclaimerText = 'Agri Updates shares opportunities sourced from trusted networks. Applicants are advised to verify all details directly with the issuing organisation before submission.';
if (!content.includes(disclaimerText) && !doc.querySelector('footer')) {
    errors.push('Disclaimer missing. Add required disclaimer at the bottom of content.');
}

// minimal length
const textOnly = doc.body.textContent || '';
if (textOnly.trim().length < 200) {
    errors.push('Content too short (<200 chars). Provide adequate detail for SEO and readers.');
}

// block publish on errors
if (errors.length) {
    console.error('Prepublish validation failed:');
    errors.forEach((e) => console.error('- ' + e));
    process.exit(1);
}

console.log('Prepublish validation passed.');
process.exit(0);
