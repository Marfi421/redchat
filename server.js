const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DATA FILE
const FILE = path.join(
    os.homedir(),
    'redchat-data.json'
);

// CREATE DATA
function init() {

    if (!fs.existsSync(FILE)) {

        const data = {
            users: [
                {
                    username: "admin",
                    password: "395545",
                    admin: true
                }
            ],
            invites: [],
            messages: []
        };

        fs.writeFileSync(
            FILE,
            JSON.stringify(data, null, 2)
        );

    }

}

// LOAD
function load() {

    init();

    return JSON.parse(
        fs.readFileSync(FILE, 'utf8')
    );

}

// SAVE
function save(data) {

    fs.writeFileSync(
        FILE,
        JSON.stringify(data, null, 2)
    );

}

// ROOT
app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'index.html')
    );

});

// LOGIN
app.post('/login', (req, res) => {

    const { username, password } = req.body;

    const data = load();

    const user = data.users.find(u =>
        u.username === username &&
        u.password === password
    );

    if (!user) {
        return res.send("bad");
    }

    if (user.admin) {
        return res.send("admin");
    }

    res.send("ok");

});

// REGISTER
app.post('/register', (req, res) => {

    const {
        username,
        password,
        invite
    } = req.body;

    const data = load();

    if (!username || !password) {
        return res.send("missing");
    }

    if (data.users.find(u => u.username === username)) {
        return res.send("exists");
    }

    const inv = data.invites.find(i =>
        i.code === invite &&
        i.active
    );

    if (!inv) {
        return res.send("badInvite");
    }

    // ONE TIME USE
    inv.active = false;

    data.users.push({
        username,
        password,
        admin: false
    });

    save(data);

    res.send("ok");

});

// GENERATE INVITE
app.post('/generate', (req, res) => {

    const data = load();

    // DISABLE OLD INVITES
    data.invites.forEach(i => {
        i.active = false;
    });

    const code = Math.random()
        .toString(36)
        .substring(2, 12);

    data.invites.push({
        code,
        active: true
    });

    save(data);

    res.send(code);

});

// USERS
app.get('/users', (req, res) => {

    const data = load();

    res.json(data.users);

});

// MESSAGES
app.get('/messages', (req, res) => {

    const data = load();

    res.json(data.messages);

});

// SOCKET CHAT
io.on('connection', (socket) => {

    console.log("CONNECTED");

    socket.on('message', (msg) => {

        const data = load();

        const message = {
            user: msg.user,
            text: msg.text
        };

        data.messages.push(message);

        save(data);

        io.emit('message', message);

    });

});

// START
server.listen(3000, '0.0.0.0', () => {

    console.log("SERVER RUNNING ON 3000");

});