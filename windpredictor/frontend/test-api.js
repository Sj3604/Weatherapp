const https = require('https');
https.get('https://frontend-drcqotrlw-shagun-jains-projects.vercel.app/api/history', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
}).on('error', err => console.log('REQ ERROR:', err.message));
