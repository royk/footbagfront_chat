var express = require('express');
var sanitize = require('validator').sanitize;
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var history = [];
var max_message_length = 250;
var max_message_history = 50;
var fs = require('fs');

// read chat history from file
fs.readFile("chat.log", "utf8", function(err, data) {
	if (err) {
		return console.log(err);
	}
	history = JSON.parse(unescape(data));
});

function writeHistoryToFile() {
	if (history.length>0) {
		fs.writeFile("chat.log", escape(JSON.stringify(history)));
	}
}

server.listen(8080);

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
	socket.on('history', function() {
		var msg = JSON.stringify(history);
		io.sockets.emit('history', msg);
	}),
	socket.on('msg', function (data) {
		// sanitize data
		if (data) {
			data.msg = sanitize(data.msg).entityEncode();
			if (data.msg.length > max_message_length) {
				data.msg = data.msg.substring(0, max_message_length);
			}
			history.push(data);
			while (history.length>max_message_history) {
				history.shift();
			}
			writeHistoryToFile();
			var msg = JSON.stringify([data]);
			console.log(data,msg);
			io.sockets.emit('new', msg);
		}
	});
});