const canvas = document.getElementById('drawingCanvas')
const ctx = canvas.getContext('2d')
const generateQRButton = document.getElementById('generateQR')
const qrcodeDiv = document.getElementById('qrcode')

let isDrawing = false
let paths = []
let currentPath = []
let lastX, lastY

canvas.width = 300
canvas.height = 300

function startDrawing(e) {
  isDrawing = true
  const { x, y } = getCoordinates(e)
  lastX = x
  lastY = y
  currentPath = [[0, 0]] // Starting point of new path
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false
    if (currentPath.length > 1) {
      paths.push(currentPath)
    }
    currentPath = []
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

  // Only record point if there's a significant change in direction
  if (Math.abs(x - lastX) > 5 || Math.abs(y - lastY) > 5) {
    const dx = x - lastX
    const dy = y - lastY
    currentPath.push([dx, dy])

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    lastX = x
    lastY = y
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

  const qr = qrcode(0, 'L')
  qr.addData(url)
  qr.make()
  qrcodeDiv.innerHTML = qr.createImgTag(5)
}

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
