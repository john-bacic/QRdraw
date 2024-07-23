const canvas = document.getElementById('drawingCanvas')
const ctx = canvas.getContext('2d')
const generateQRButton = document.getElementById('generateQR')
const qrcodeDiv = document.getElementById('qrcode')

let isDrawing = false
let points = []

canvas.width = 300
canvas.height = 300

function startDrawing(e) {
  isDrawing = true
  draw(e)
}

function stopDrawing() {
  isDrawing = false
}

function draw(e) {
  if (!isDrawing) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  points.push([x, y])

  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000'

  if (points.length > 1) {
    const prevPoint = points[points.length - 2]
    ctx.beginPath()
    ctx.moveTo(prevPoint[0], prevPoint[1])
    ctx.lineTo(x, y)
    ctx.stroke()
  }
}

function generateQRCode() {
  const data = JSON.stringify(points)

  // In a real application, you would send this data to your server
  // and get back a unique ID. For this example, we'll generate a random ID.
  const id = Math.random().toString(36).substr(2, 9)

  const url = `http://yourdomain.com/view.html?id=${id}`
  const qr = qrcode(0, 'L')
  qr.addData(url)
  qr.make()
  qrcodeDiv.innerHTML = qr.createImgTag(5)

  // In a real application, you would save the 'data' on your server with this 'id'
  console.log(`Drawing data for id ${id}:`, data)
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
