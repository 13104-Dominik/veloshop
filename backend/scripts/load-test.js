// Test wydajnościowy: uruchom najpierw serwer (npm start), potem npm run test:load
const autocannon = require('autocannon');
const url = process.env.TARGET || 'http://localhost:3000/api/bikes';
autocannon({ url, connections: 50, duration: 10 }, (err, r) => {
  if (err) throw err;
  console.log(`URL: ${url}`);
  console.log(`Żądań/s (średnio): ${r.requests.average}`);
  console.log(`Opóźnienie p50/p97.5/p99: ${r.latency.p50} / ${r.latency.p97_5} / ${r.latency.p99} ms`);
  console.log(`Odpowiedzi 2xx: ${r['2xx']}, non-2xx: ${r.non2xx}, błędy: ${r.errors}, timeouty: ${r.timeouts}`);
  process.exit(r.non2xx > 0 || r.errors > 0 ? 1 : 0);
});
