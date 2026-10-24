const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'videos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const videos = [
  { url: 'https://pub-4c2c1f81870544708aa5a84832afaf3d.r2.dev/shadows/shadow_leaves.webm', file: 'shadow_leaves.webm' },
  { url: 'https://pub-4c2c1f81870544708aa5a84832afaf3d.r2.dev/shadows/shadow_home.webm', file: 'shadow_home.webm' },
  { url: 'https://pub-4c2c1f81870544708aa5a84832afaf3d.r2.dev/shadows/shadow_services.webm', file: 'shadow_services.webm' },
  { url: 'https://assets.lenvalproperties.com/projects/project-j_src.mp4', file: 'project-j_src.mp4' },
  { url: 'https://assets.lenvalproperties.com/og.mp4', file: 'og.mp4' }
];

const agent = new https.Agent({ rejectUnauthorized: false });

async function download(item) {
  const dest = path.join(targetDir, item.file);
  return new Promise((resolve, reject) => {
    https.get(item.url, { agent }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { agent }, (res2) => {
          const stream = fs.createWriteStream(dest);
          res2.pipe(stream);
          stream.on('finish', () => { stream.close(); resolve(); });
        }).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        console.error(`Failed ${item.file}: ${res.statusCode}`);
        return resolve();
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for (const v of videos) {
    process.stdout.write(`Downloading ${v.file}... `);
    try {
      await download(v);
      const stat = fs.statSync(path.join(targetDir, v.file));
      console.log(`OK (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (e) {
      console.error(`ERROR: ${e.message}`);
    }
  }
  console.log('Videos downloaded!');
})();
