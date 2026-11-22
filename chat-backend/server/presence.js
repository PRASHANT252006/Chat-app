
const { redisClient } = require('../utils/redis');

async function addUser(userId, socketId) {
    const key = `sockets:${userId}`;

    const added = await redisClient.sAdd(key, socketId);

    const count = await redisClient.sCard(key);

    if (added === 1 && count === 1) {
        await redisClient.sAdd('online:users', userId);
        return true;
    }

    return false;
}

async function deleteUser(userId, socketId) {
    const key = `sockets:${userId}`;

    const removed = await redisClient.sRem(key, socketId);

    if (removed === 0) return false;

    const count = await redisClient.sCard(key);

    if (count === 0) {
        await redisClient.sRem('online:users', userId);
        return true;
    }

    return false;
}

async function clearPresence() {
    await redisClient.del('online:users');

    for await (const batch of redisClient.scanIterator({
        MATCH: 'sockets:*',
        COUNT: 100
    })) {
        const keys = Array.isArray(batch) ? batch : [batch];
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    }

    console.log('Old presence data cleared');
}
async function getOnlineUserIds() {
    return await redisClient.sMembers('online:users');
}

module.exports = {
    addUser,
    deleteUser,
    getOnlineUserIds,
    clearPresence
};
