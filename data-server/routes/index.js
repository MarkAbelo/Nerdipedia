import accountRoutes from './accounts.js';
import postRoutes from './posts.js';
import bookRoutes from './books.js';
import showRoutes from './shows.js';
import movieRoutes from './movies.js';
import reviewsRoutes from './reviews.js';
import imageRoutes from './images.js';

const constructorMethod = (app) => {
    // defined routes
    app.use('/accounts', accountRoutes);
    app.use('/posts', postRoutes);
    app.use('/books', bookRoutes);
    app.use('/shows', showRoutes);
    app.use('/movies', movieRoutes);
    app.use('/reviews', reviewsRoutes);
    app.use('/images', imageRoutes);

    // undefined routes
    app.use('/{*any}', (_req, res) => {
        res.status(404).json({error: "data route not found"});
    });
};

export default constructorMethod;