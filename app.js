// imports and setting
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const net = require('net')

const httpPort = 3000

const TCPhost = 'localhost' // you might want to change it to your local ip for forwarding
const TCPport = 7070
const server = net.createServer()
let sockets = []

//creating tcp sever
server.listen(TCPport, TCPhost, () => {
	console.log('TCP Server is running on port ' + TCPport + '.')
})

server.on('connection', function (sock) {
	console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
	sockets.push(sock)

	// currently not used, but it will be usefull in future versions
	sock.on('data', function (data) {
		console.log('DATA ' + sock.remoteAddress + ': ' + data)
		// Write the data back to all the connected, the client will receive it as data from the server
		sockets.forEach(function (sock, index, array) {
			sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n')
		})
	})

	// close socket
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
http.listen(httpPort, function () {
	console.log('listening on *:' + httpPort)
});


// socket io
// for comunication with web and printers
io.on('connection', function (socket) {
	console.log('user connected');
	socket.on('disconnect', function () {
		console.log('user disconnected');
	});
	socket.on('position', function (msg) {
		io.emit('position', msg)
		sockets.map((socket) => socket.write(msg))
	});
});
