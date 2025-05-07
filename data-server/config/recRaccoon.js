import raccoon from '@maruware/raccoon';

export const bookRec = new raccoon.default({
    className: 'book',
    redisUrl: 'localhost:6379'
});

export const showRec = new raccoon.default({
    className: 'show',
    redisUrl: 'localhost:6379'
});

export const movieRec =new raccoon.default({
    className: 'movie',
    redisUrl: 'localhost:6379'
});

