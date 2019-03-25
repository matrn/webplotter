const socket = io()

// form for sending coordinates
let form = document.getElementById('mainForm')
let x = document.getElementById('x')
let y = document.getElementById('y')

form.addEventListener('submit', function (e) {
	e.preventDefault()
	socket.emit('position', x.value + '%' + y.value)
	x.value = ''
	y.value = ''
}, true)

//canvas declarations
let canvas = document.getElementById('mainCanvas')
let clickX = new Array();
let clickY = new Array();
let clickDrag = new Array();
let paint;

// canvas paint the user input
let context = canvas.getContext('2d');
context.fillStyle = '#FF8984';
socket.on('position', function (data) {
	let res = data.split('%')
	context.fillRect(res[0], res[1], 5, 5);
});

// throttling function
function throttle (delay, fn) {
	let lastCall = 0;
	return function (...args) {
		const now = (new Date).getTime();
		if (now - lastCall < delay) {
			return;
		}
		lastCall = now;
		return fn(...args);
	}
}
// send position to server
canvas.addEventListener('mousedown', function (e) {
	let mouseX = e.pageX - this.offsetLeft;
	let mouseY = e.pageY - this.offsetTop;
	paint = true;
	socket.emit('position', mouseX + '%' + mouseY)
})

function handler (e, that) {

}
canvas.addEventListener('mousemove', throttle(10, function (e) {
	if (paint) {
		socket.emit('position', (e.pageX - canvas.offsetLeft) + '%' + (e.pageY - canvas.offsetTop))
	}
}))

canvas.addEventListener('mouseup', function (e) {
	paint = false;
})