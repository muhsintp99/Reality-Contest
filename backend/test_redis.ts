import net from 'net';
import Redis from 'ioredis';

console.log('--- TEST 1: RAW TCP CONNECT TO 127.0.0.1:6379 ---');
const startTcp = Date.now();
const socket = net.connect(6379, '127.0.0.1', () => {
  console.log(`[TCP SUCCESS] Connected to 127.0.0.1:6379 in ${Date.now() - startTcp}ms`);
  socket.end();
  testRedisClient();
});

socket.on('error', (err) => {
  console.log(`[TCP ERROR] Failed to connect to 127.0.0.1:6379 in ${Date.now() - startTcp}ms:`, err.message);
  testRedisClient();
});

function testRedisClient() {
  console.log('\n--- TEST 2: IOREDIS CONNECT TO 127.0.0.1:6379 ---');
  const startRedis = Date.now();
  const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    connectTimeout: 3000,
    maxRetriesPerRequest: null
  });

  redis.on('connect', () => {
    console.log(`[IOREDIS CONNECT] Connected in ${Date.now() - startRedis}ms`);
  });

  redis.on('ready', () => {
    console.log(`[IOREDIS READY] Ready in ${Date.now() - startRedis}ms`);
    redis.ping().then((res) => {
      console.log(`[IOREDIS PING] Response: ${res}`);
      redis.disconnect();
      process.exit(0);
    });
  });

  redis.on('error', (err) => {
    console.log(`[IOREDIS ERROR] Error after ${Date.now() - startRedis}ms:`, err.message);
  });
}
