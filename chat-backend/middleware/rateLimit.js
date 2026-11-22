
const { redisClient } = require('../utils/redis');
const { customApiError } = require('../error/customApiError');

const rateLimit = (name, limit, windowSeconds, keyFn) => {

    return async (req, res, next) => {
        try {
            const key = `rl:${name}:${keyFn(req)}`;

            const count = await redisClient.incr(key);

            if (count === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            if (count > limit) {
                throw new customApiError(
                    429,
                    'Too many requests, try again later'
                );
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = rateLimit;
