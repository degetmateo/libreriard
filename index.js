require('dotenv').config();

const express = require('express');
const path = require('path');

const FRONTEND_HTML_PATH = path.join(__dirname, '/public/index.html');

const app = express();

app.set('port', process.env.PORT || 4000);

app.get('/', (req, res) => {
    res.sendFile(FRONTEND_HTML_PATH);
});

app.listen(app.get('port'), () => {
    console.log(`✅ | Server listening on PORT: ${app.get('port')}`);
});