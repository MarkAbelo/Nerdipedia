import Raccoon from '@maruware/raccoon';

export const bookRec = new Raccoon({
    className: 'book',
    redisUrl: 'localhost:6379'
});

export const showRec = new Raccoon({
    className: 'show',
    redisUrl: 'localhost:6379'
});

export const movieRec = new Raccoon({
    className: 'movie',
    redisUrl: 'localhost:6379'
});