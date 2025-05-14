import Raccoon from '@maruware/raccoon';

export const bookRec = new Raccoon.default({
    className: 'book',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'

});

export const showRec = new Raccoon.default({
    className: 'show',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'

});

export const movieRec =new Raccoon.default({
    className: 'movie',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'

});

