const Redis = require('ioredis');

const config = {
  host: 'localhost',
  port: 6380,
  password: 'dev_redis_password',
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

const redis = new Redis(config);

redis.ping().then(pong => {
  console.log('Redis ping response:', pong);
  redis.quit();
}).catch(err => {
  console.error('Redis error:', err);
  redis.quit();
});
