import accountRoutes from './accounts.js';
import postRoutes from './posts.js';
import bookRoutes from './books.js';
import showRoutes from './shows.js';
import movieRoutes from './movies.js';

const constructorMethod = (app) => {
    // defined routes
    app.use('/accounts', accountRoutes);
    app.use('/posts', postRoutes);
    app.use('/books', bookRoutes);
    app.use('/shows', showRoutes);
    app.use('/movies', movieRoutes);

    // undefined routes
    app.use('*', (_req, res) => {
        res.status(404).json({error: "data route not found"});
    });
};

export default constructorMethod;