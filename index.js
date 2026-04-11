require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');

const pool = require('./database/database');

const productsRouter = require('./routes/products.router.js');

const FRONTEND_HTML_PATH = path.join(__dirname, '/public/index.html');
const FRONTEND_PUBLIC_PATH = path.join(__dirname, '/public/');

const app = express();

const isDev = process.env.NODE_ENV === 'dev';
const secureSource = isDev ? process.env.DEV_URL : process.env.PROD_URL;

app.set('port', process.env.PORT);

const connectSrc = ["'self'", secureSource, "https://ka-f.fontawesome.com/"];
const scriptSrc = ["'self'", "https://kit.fontawesome.com/"]

const directives = {
    "default-src": [
        "'none'",
    ],
    "connect-src": connectSrc,
    "script-src": scriptSrc,
    "img-src": [
        "'self'"
    ],
    "style-src": [
        "'self'", 
        "'unsafe-inline'"
    ],
};

isDev ? directives["upgrade-insecure-requests"] = null : null;

app.use(
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: directives,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(FRONTEND_PUBLIC_PATH));

app.use((_, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/api/products', productsRouter);

app.use(async (_, res) => {
    res.sendFile(FRONTEND_HTML_PATH);
    const query = await pool.query('SELECT NOW();');
    console.log(query);
});


app.listen(app.get('port'), "0.0.0.0", () => {
    console.log(`✅ | Server listening on PORT: ${app.get('port')}`);
});