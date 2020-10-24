const express = require('express');
const path = require('path');
const app = express();

const { ABOTKIT_DOLORES_PORT, ABOTKIT_MAEVE_URL, ABOTKIT_MAEVE_PORT } = process.env;
const port = ABOTKIT_DOLORES_PORT || 21520;

app.set('views', path.join(__dirname, 'build'));
app.engine('html', require('ejs').renderFile);

app.use('/static', express.static(path.join(__dirname, 'build/static')));
app.get('*', (req, res) => { res.render('index.html', { ABOTKIT_MAEVE_PORT, ABOTKIT_MAEVE_URL })});

app.listen(port, () => console.log(`Dolores listening on port ${port}!`));