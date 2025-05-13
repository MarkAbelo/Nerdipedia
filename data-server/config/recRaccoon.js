import Raccoon from '@maruware/raccoon';

export const bookRec = new Raccoon.default({
    className: 'book',
    redisUrl: 'localhost:6379'
});

export const showRec = new Raccoon.default({
    className: 'show',
    redisUrl: 'localhost:6379'
});

export const movieRec =new Raccoon.default({
    className: 'movie',
    redisUrl: 'localhost:6379'
});

