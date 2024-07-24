const canvas = document.getElementById('drawingCanvas')
const ctx = canvas.getContext('2d')
const generateQRButton = document.getElementById('generateQR')
const qrcodeDiv = document.getElementById('qrcode')
const progressRing = document.getElementById('progress-ring')
const counterText = document.getElementById('counter-text')
const densitySlider = document.getElementById('densitySlider')
const densityValue = document.getElementById('densityValue')

let isDrawing = false
let paths = []
let currentPath = []
let lastX, lastY
let pointDensity = 6 // Default density

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

const MAX_POINTS = 100

const RING_CIRCUMFERENCE = 2 * Math.PI * 25 // 25 is the radius of our SVG circle

function updateCounter() {
  const totalPoints =
    paths.reduce((sum, path) => sum + path.length, 0) + currentPath.length
  const used = totalPoints
  const percentage = (used / MAX_POINTS) * 100

  // Update the ring
  const offset = RING_CIRCUMFERENCE - (percentage / 100) * RING_CIRCUMFERENCE
  progressRing.style.strokeDashoffset = offset

  // Update the text
  counterText.textContent = used

  if (used >= MAX_POINTS) {
    stopDrawing()
    canvas.style.cursor = 'not-allowed'
    progressRing.style.stroke = 'red'
  }
}

function startDrawing(e) {
  const totalPoints =
    paths.reduce((sum, path) => sum + path.length, 0) + currentPath.length
  if (totalPoints >= MAX_POINTS) return

  isDrawing = true
  const { x, y } = getCoordinates(e)
  lastX = x
  lastY = y
  currentPath = [[x, y]]
  updateCounter()
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false
    if (currentPath.length > 1) {
      paths.push(currentPath)
    }
    currentPath = []
    updateCounter()
  }
}

function getCoordinates(e) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: Math.round(e.clientX - rect.left),
    y: Math.round(e.clientY - rect.top),
  }
}

function draw(e) {
  if (!isDrawing) return

  const { x, y } = getCoordinates(e)

  const totalPoints =
    paths.reduce((sum, path) => sum + path.length, 0) + currentPath.length
  if (totalPoints >= MAX_POINTS) {
    stopDrawing()
    return
  }

  // Adjust the threshold calculation for a wider range
  const threshold = Math.pow(2, 11 - pointDensity) // This will give a range from 2^10 to 2^1

  if (Math.abs(x - lastX) > threshold || Math.abs(y - lastY) > threshold) {
    currentPath.push([x, y])

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    lastX = x
    lastY = y

    updateCounter()
  }
}

function compressPoints(paths) {
  return paths
    .map((path) =>
      path
        .map(([x, y]) => [x.toString(36), y.toString(36)])
        .flat()
        .join(',')
    )
    .join(';')
}

function generateQRCode() {
  if (currentPath.length > 1) {
    paths.push(currentPath)
  }
  const compressed = compressPoints(paths)
  const url = `https://john-bacic.github.io/QRdraw/view.html?d=${compressed}`

  // Encode the URL to pass it safely in the query string
  const encodedUrl = encodeURIComponent(url)

  // Redirect to the QR code page
  window.location.href = `qr.html?url=${encodedUrl}`
}

// Update the density slider event listener
densitySlider.addEventListener('input', function (e) {
  pointDensity = parseInt(e.target.value)
  console.log(`Point density set to: ${pointDensity}`)
})

canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mouseup', stopDrawing)
canvas.addEventListener('mouseout', stopDrawing)

generateQRButton.addEventListener('click', generateQRCode)

// For mobile touch events
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  startDrawing(e.touches[0])
})
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  draw(e.touches[0])
})
canvas.addEventListener('touchend', stopDrawing)

densitySlider.addEventListener('input', function (e) {
  pointDensity = parseInt(e.target.value)
  densityValue.textContent = pointDensity
  console.log(`Point density set to: ${pointDensity}`)
})

document.addEventListener('DOMContentLoaded', function () {
  var slider = document.getElementById('densitySlider')
  var densityValue = document.getElementById('densityValue')
  var progressRing = document.getElementById('progress-ring')
  var counterText = document.getElementById('counter-text')

  slider.addEventListener('input', function () {
    densityValue.textContent = this.value

    // Update progress ring
    var progress = ((this.value - 1) / 9) * 157 // 157 is the total length of the circle
    progressRing.setAttribute('stroke-dashoffset', 157 - progress)

    // Update counter text
    counterText.textContent = this.value
  })
})

updateCounter()
