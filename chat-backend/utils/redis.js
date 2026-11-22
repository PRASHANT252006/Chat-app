const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

const pub = createClient({
    url: process.env.REDIS_URL
});

const sub = pub.duplicate();

redisClient.on('error', (err) => {
    console.log('Redis Client Error:', err);
});

pub.on('error', (err) => {
    console.log('Redis Publisher Error:', err);
});

sub.on('error', (err) => {
    console.log('Redis Subscriber Error:', err);
});

const connectRedis = async () => {
    await redisClient.connect();
    await pub.connect();
    await sub.connect();

    console.log('Redis clients connected successfully');
};

module.exports = {
    redisClient,
    pub,
    sub,
    connectRedis
};
