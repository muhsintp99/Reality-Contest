const http = require('http');

http.get('http://localhost:5000/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS CODE:', res.statusCode);
    console.log('RESPONSE:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
}).on('error', (err) => {
  console.error('Error connecting to backend health check:', err.message);
  process.exit(1);
});
