var express      = require("../node_modules/express");
var app          = express();
var path         = require("path");

var jsonServer   = require('../node_modules/json-server');
var server       = jsonServer.create();
var router       = jsonServer.router('demo-server/db.json');

// Authentication Libraries - Start
var cookieParser = require('../node_modules/cookie-parser');
var session      = require('../node_modules/express-session');
// Authentication Libraries - End

server.use(cookieParser("security", {"path": "/"}));
app.use(cookieParser("security", {"path": "/"}));

server.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    res.setHeader("Access-Control-Expose-Headers","Access-Control-Allow-Origin");
    res.setHeader("Access-Control-Allow-Headers", 
"X-Custom-Header,X-Requested-With,X-Prototype-Version,Content-Type,Cache-Control,Pragma,Origin,content-type");

    if (!req.signedCookies.usersession && req._parsedUrl.pathname != "/auth/login" && req.method != "OPTIONS") {
        res.redirect('http://localhost:8080/app/pages/auth/auth.html');
    }else{
        next();
    }
});

server.post('/auth/login', function(req, res){
    var users = router.db.object.users;
    var username = req.query.username;
    var password = req.query.password;
    for(var i=0;i<=users.length -1;i++){
        if(users[i].username == username && users[i].password == password) {
            res.cookie('usersession', users[i].id, {maxAge: 9000000, httpOnly: false, signed: true});
            res.send(JSON.stringify({success: true}));
            return;
        }
    }
    res.send(JSON.stringify({ success: false, error: 'Wrong username or password' }));
});

server.get('/profile', function(req,res){
    var userID = req.signedCookies.usersession;
    var users = router.db.object.profiles;
    for(var i=0;i<=users.length -1;i++){
        if(users[i].userId == userID){
            res.send(JSON.stringify(users[i]));
            return;
        }
    }
    res.send();
});

app.get('/', function(req, res){
    if (!req.signedCookies.usersession) {
        res.redirect('app/pages/auth/auth.html');
    }else{
        res.sendFile(path.join(__dirname+'/../app/index.html'));
    }
});

app.get('/auth/logout', function(req, res){
    res.clearCookie('usersession');
    res.redirect('/app/pages/auth/auth.html');
});

app.use(express.static(path.join(__dirname, '../')));
var http = require('http').Server(app);

server.use(jsonServer.defaults); // logger, static and cors middlewares
server.use(router); // Mount router on '/'
server.listen(5000);

var io = require('socket.io')(http);
http.listen(8080);
io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        msg = JSON.parse(msg);
        io.sockets.in(msg.room).emit('private message', 
                    JSON.stringify(msg));
    });
    socket.on('subscribe', function(msg) {
        socket.username = msg.user;
        socket.room = msg.room;
        socket.join(msg.room);
    });
});