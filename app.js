// imports and setting
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const net = require('net')
const port = 7070
const host = 'localhost' // you might want to change it to your local ip for forwarding


//creating tcp sever
const server = net.createServer()
server.listen(port, host, () => {
	console.log('TCP Server is running on port ' + port + '.')
})

let sockets = []

server.on('connection', function (sock) {
	console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
	sockets.push(sock)

	sock.on('data', function (data) {
		console.log('DATA ' + sock.remoteAddress + ': ' + data)
		// Write the data back to all the connected, the client will receive it as data from the server
		sockets.forEach(function (sock, index, array) {
			sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n')
		})
	})

	// Add a 'close' event handler to this instance of socket
	sock.on('close', function (data) {
		let index = sockets.findIndex(function (o) {
			return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort
		})
		if (index !== -1) sockets.splice(index, 1)
		console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
	})
})


// express routes
app.use(express.static('public'))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html')
});
app.get('/status', function (req, res) {
	res.sendFile(__dirname + '/public/status.html')
});

//start http sever
http.listen(3000, function () {
	console.log('listening on *:3000')
});


// socket io
// for comunication with web and printers
io.on('connection', function (socket) {
	console.log('a user connected');
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
	socket.on('position', function (msg) {
		io.emit('position', msg)
		sockets.map((socket) => socket.write(msg))
	});
});
