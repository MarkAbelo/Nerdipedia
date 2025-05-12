import express from "express";
import configRoutes from './routes/index.js';
import cors from 'cors';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

configRoutes(app);

app.listen(3000, () => {
    console.log("Data Server Online");
    console.log('Data routes will be running on http://localhost:3000');
});