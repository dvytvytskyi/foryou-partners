const dotenv = require('dotenv');
const Redis = require('ioredis');

async function run() {
  dotenv.config({ path: '.env' });
  const redis = new Redis(process.env.REDIS_URL);
  
  const cached = await redis.get('amo:users_map');
  if (cached) {
    const data = JSON.parse(cached);
    console.log('Cached Users:');
    data.forEach(([id, val]) => console.log(id, val));
  } else {
    console.log('No cached users');
  }
  process.exit(0);
}
run();
