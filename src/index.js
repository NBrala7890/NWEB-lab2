const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// toggle for XSS vulnerability
let xssEnabled = false;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS) from the "public" directory
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { xssEnabled });
});

app.post('/submit', (req, res) => {
    const userInput = req.body.userInput;
    let displayText = xssEnabled ? userInput : escapeHTML(userInput);
    res.render('index', { displayText, xssEnabled });
});

app.post('/toggle-xss', (req, res) => {
    xssEnabled = !xssEnabled;
    res.redirect('/');
});

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (match) => {
        const escapeChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeChars[match];
    });
}

app.listen(3000, () => console.log('App running on http://localhost:3000'));
