const socket = io()

let throttleTime = 10

let form = document.getElementById('mainForm')
let formX = document.getElementById('x')
let formY = document.getElementById('y')

let canvas = document.getElementById('mainCanvas')
let context = canvas.getContext('2d')
let lastX
let lastY
let paint
let firstTap = false
let statusCanvas = document.getElementById('statusCanvas')
let statusContext = statusCanvas.getContext('2d')


// form send coordinates
form.addEventListener('submit', function (e) {
	e.preventDefault()
	socket.emit('position', formX.value + '%' + formY.value)
	formX.value = ''
	formY.value = ''
}, true)

// canvas paint the user input

context.fillStyle = '#FF8984'
socket.on('position', function (data) {
	let res = data.split('%')
	if (firstTap) {
		context.beginPath()
		context.moveTo(lastX, lastY)
		context.lineTo(res[0], res[1])
		context.stroke()

		statusContext.beginPath()
		statusContext.moveTo(lastX, lastY)
		statusContext.lineTo(res[0], res[1])
		statusContext.stroke()
	}
	else {
		context.fillRect(res[0], res[1], 1, 1)
		statusContext.fillRect(res[0], res[1], 1, 1)
	}
	lastX = res[0]
	lastY = res[1]
});


// throttling function
function throttle (delay, fn) {
	let lastCall = 0
	return function (...args) {
		const now = (new Date).getTime()
		if (now - lastCall < delay) {
			return
		}
		lastCall = now
		return fn(...args)
	}
}

// send position to server
canvas.addEventListener('mousedown', function (e) {
	let mouseX = e.pageX - this.offsetLeft
	let mouseY = e.pageY - this.offsetTop
	paint = true
	socket.emit('position', mouseX + '%' + mouseY)
})

canvas.addEventListener('mousemove', throttle(throttleTime, function (e) {
	if (paint) {
		let mouseX = e.pageX - canvas.offsetLeft
		let mouseY = e.pageY - canvas.offsetTop
		socket.emit('position', mouseX + '%' + mouseY)
		firstTap = true

	}
}))

function stopPainting () {
	paint = false
	firstTap = false
}
canvas.addEventListener('mouseup', stopPainting)
canvas.addEventListener('mouseleave', stopPainting)