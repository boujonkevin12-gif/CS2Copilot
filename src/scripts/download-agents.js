const https = require('https');
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../../public/agents');
fs.mkdirSync(AGENTS_DIR, { recursive: true });

function download(url, filename) {
  return new Promise((resolve, reject) => {
    function doFetch(u) {
      https.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return doFetch(res.headers.location);
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const fp = path.join(AGENTS_DIR, filename);
          fs.writeFileSync(fp, buf);
          console.log(`${filename}: ${buf.length} bytes (${(buf.length/1024).toFixed(1)}KB)`);
          resolve(buf.length);
        });
      }).on('error', reject);
    }
    doFetch(url);
  });
}

async function main() {
  // Download several candidate character images
  const images = [
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG102.png', name: 'ct1.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG100.png', name: 'ct2.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG18.png', name: 't1.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG19.png', name: 't2.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG20.png', name: 't3.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG76.png', name: 'ct3.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG84.png', name: 'misc1.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG101.png', name: 'ct4.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG103.png', name: 't4.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG99.png', name: 'ct5.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG104.png', name: 't5.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG105.png', name: 'ct6.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG106.png', name: 't6.png' },
    { url: 'https://pngimg.com/uploads/counter_strike/counter_strike_PNG107.png', name: 'misc2.png' },
  ];

  for (const img of images) {
    await download(img.url, img.name);
  }
}

main().catch(console.error);
