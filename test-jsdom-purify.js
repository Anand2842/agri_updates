const DOMPurify = require('isomorphic-dompurify');

console.log('Testing isomorphic-dompurify / jsdom environment...');

try {
    const dirty = '<p>Hello <script>alert("hack")</script> World</p>';
    const clean = DOMPurify.sanitize(dirty);

    console.log('Original:', dirty);
    console.log('Cleaned: ', clean);

    if (clean === '<p>Hello  World</p>' || clean.includes('Hello') && !clean.includes('script')) {
        console.log('✅ Sanitization successful!');
    } else {
        console.error('❌ Sanitization produced unexpected output:', clean);
        process.exit(1);
    }

} catch (err) {
    console.error('❌ CRASHED during sanitization!');
    console.error(err);
    process.exit(1);
}
