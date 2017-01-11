var express      = require("../node_modules/express");
var app          = express();
var path         = require("path");

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../app/index.html'));
});
app.use(express.static(path.join(__dirname, '../')));
var http = require('http').Server(app);
http.listen(8080);