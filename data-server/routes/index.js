const constructorMethod = (app) => {
    // defined routes
    app.use('/accounts');

    // undefined routes
    app.use('*', (_req, res) => {
        res.status(404).json({error: "data route not found"});
    });
};

export default constructorMethod;