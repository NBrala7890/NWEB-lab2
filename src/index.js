const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let xssEnabled = false; // Toggle for XSS vulnerability
let brokenAccessEnabled = false; // Toggle for Broken Access Control vulnerability

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Sample user data
const users = {
    "12345": { firstname: "Ray", lastname: "Liotta", password: "rayliotta123" },
    "12346": { firstname: "Robert", lastname: "De Niro", password: "robertdeniro456" },
    "12347": { firstname: "Joe", lastname: "Pesci", password: "joepesci789" },
};

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Route for XSS demonstration
app.get('/xss', (req, res) => {
    res.render('xss', { xssEnabled, brokenAccessEnabled });
});

app.post('/submit', (req, res) => {
    const userInput = req.body.userInput;
    let displayText = xssEnabled ? userInput : escapeHTML(userInput);
    res.render('xss', { displayText, xssEnabled, brokenAccessEnabled });
});

app.post('/toggle-xss', (req, res) => {
    xssEnabled = !xssEnabled;
    res.redirect('/xss');
});

// Route for Broken Access Control demonstration
app.get('/userData/:id', (req, res) => {
    const requestedId = req.params.id;
    const loggedInUserId = "12345"; // Assume "12345" is the logged-in user
    const user = users[requestedId];

    if (!user) {
        return res.send("User not found");
    }

    // Display a message showing which user is logged in
    const loggedInMessage = `User ${loggedInUserId} is logged in`;

    // If Broken Access Control is enabled, only allow access to the logged-in user's data
    if (brokenAccessEnabled && requestedId !== loggedInUserId) {
        return res.send("<script>alert('Access Denied');</script>");
    }

    res.render('userData', { user, requestedId, brokenAccessEnabled, loggedInMessage });
});

app.post('/toggle-access', (req, res) => {
    brokenAccessEnabled = !brokenAccessEnabled;
    res.redirect(`/userData/12345`);
});

function escapeHTML(str) {
    return str.replace(/[&<>"']/g, (match) => {
        const escapeChars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeChars[match];
    });
}

app.listen(3000, () => console.log('App running on http://localhost:3000'));
