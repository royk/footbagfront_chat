var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var history = [];

server.listen(8080);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
	socket.on('history', function() {
		if (history.length>0) {
			var msg = JSON.stringify(history);
			io.sockets.emit('history', msg);
		}

	}),
	socket.on('msg', function (data) {
	  	history.push(data);
	  	if (history.length>50) {
	  		history.shift();
	  	}
	  	var msg = JSON.stringify([data]);
		io.sockets.emit('new', msg);
	});
});