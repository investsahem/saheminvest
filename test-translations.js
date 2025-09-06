// Test translation system
const { translations, translateKey } = require('./app/lib/translations.ts');

console.log('Available translations:', Object.keys(translations));
console.log('English deals:', translations.en.deals);
console.log('Arabic deals:', translations.ar.deals);

// Test translation function
console.log('Test EN hero_title:', translateKey('deals.hero_title', 'en'));
console.log('Test AR hero_title:', translateKey('deals.hero_title', 'ar'));
