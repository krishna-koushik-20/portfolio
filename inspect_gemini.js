const g = require('@google/generative-ai');
console.log('exports:', Object.keys(g));
if (g.GoogleGenerativeAI) {
  console.log('GoogleGenerativeAI available');
  const client = new g.GoogleGenerativeAI({ apiKey: 'test' });
  console.log('client prototype keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
  console.log('client instance keys:', Object.keys(client));
}
