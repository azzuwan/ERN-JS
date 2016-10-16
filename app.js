var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var moment = require('moment');
var websocket = require("socket.io");
var rdb = require("rethinkdb");


var routes = require('./routes/index');
var users = require('./routes/users');
var nodes = require('./routes/nodes');
var videos = require('./routes/videos');

var app = express();
var wsock = websocket();

app.wsock = wsock;

var env = nunjucks.configure('views', {autoescape: true, express: app});
env.addFilter("unix_to_date", function(timestamp){
  return moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss");  
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/nodes', nodes);
app.use('/videos', videos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var clientSocket = null;

app.wsock.on("connection", function(socket){
  clientSocket = socket;
  //console.log("Socket client ", socket);
  socket.emit("connected",{msg: "hello"});
});


var dbConn = null;

rdb.connect({host: 'localhost', port: 28015}, function(err, conn){
  if (err) throw err;
  dbConn = conn; 
  rdb.db("ERN").table("nodes").changes().run(conn, function(nodesErr, cursor){
    if (nodesErr) throw nodesErr;
    cursor.each(function(err, row) {
      if (err) throw err;
      console.log(JSON.stringify(row, null, 2));
      app.wsock.sockets.emit("nodes", row); 
    }); 
           
  });

  rdb.db("ERN").table("alerts").changes().run(conn, function(err,cursor){
    cursor.each(function(curErr, changes){
      if (curErr) throw curErr;
      console.log("Alert updates: ", changes);
      app.wsock.sockets.emit("alerts", changes);  
    });
    
  });
});

module.exports = app;
