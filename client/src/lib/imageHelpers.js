
function resizeToFill({ canvasWidth, canvasHeight, imageHeight, imageWidth }) {
  let drawnWidth, drawnHeight, x, y

  if (imageHeight < canvasHeight && imageWidth < canvasWidth) {
    drawnWidth = imageWidth
    drawnHeight = imageHeight
    x = (canvasWidth - drawnWidth) / 2
    y = (canvasHeight - drawnHeight) / 2
  } else if ((imageWidth / canvasWidth) > (imageHeight / canvasHeight)) {
    drawnWidth = (canvasHeight / imageHeight) * imageWidth
    drawnHeight = canvasHeight
    x = (canvasWidth - drawnWidth) / 2
    y = 0
  } else {
    drawnWidth = canvasWidth
    drawnHeight = (canvasWidth / imageWidth) * imageHeight
    x = 0
    y = (canvasHeight - drawnHeight) / 2
  }
  return { x, y, drawnWidth, drawnHeight }
}

function resizeToFit({ canvasWidth, canvasHeight, imageHeight, imageWidth }){
  let drawnWidth, drawnHeight

  if (imageHeight < canvasHeight && imageWidth < canvasWidth) {
    drawnWidth = imageWidth
    drawnHeight = imageHeight
  } else {
    const ratio = (imageHeight / canvasHeight) > (imageWidth / canvasWidth)
      ? imageHeight / canvasHeight
      : imageWidth / canvasWidth

    drawnWidth = imageWidth / ratio
    drawnHeight = imageHeight / ratio
  }

  const x = drawnWidth < canvasWidth ? (canvasWidth - drawnWidth) / 2 : 0
  const y = drawnHeight < canvasHeight ? (canvasHeight - drawnHeight) / 2 : 0
  return { x, y, drawnWidth, drawnHeight }
}


function fileToImageDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new global.FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsDataURL(file)
  })
}

function loadImage(src){
  return new Promise((resolve, reject) => {
    const image = new global.Image()
    image.onload = function(){ resolve(image) }
    image.onerror = function(error){
      if (!(error instanceof Error)){
        console.error(error)
        error = new Error(`Error loading image`)
      }
      reject(error)
    }
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = src
  })
}

function imageToDataURL(image, options = {}){
  const {
    type = 'image/png',
    encoderOptions,
  } = options
  const canvas = global.document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  return canvas.toDataURL(type, encoderOptions)
}

async function deanimateImage(image, options = {}){
  if (!image.src.match(/data:image\/(gif|webp)/)) return image
  const src = imageToDataURL(image, options)
  return await loadImage(src)
}

async function fileToImage(file){
  return await loadImage(
    await fileToImageDataURL(file)
  )
}

async function resizeImage({
  image,
  dataUri,
  height,
  width,
  resizeTo,
  type = 'image/png',
  encoderOptions,
}){
  if (dataUri) image = await loadImage(dataUri)
  const onResize = resizeTo === 'fill' ? resizeToFill : resizeToFit
  const canvas = global.document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const {x, y, drawnWidth, drawnHeight} = onResize({
    canvasWidth: width,
    canvasHeight: height,
    imageHeight: image.height,
    imageWidth: image.width,
  })

  context.drawImage(image, x, y, drawnWidth, drawnHeight)

  return canvas.toDataURL(type, encoderOptions)
}

const aspectRatioToTopPadding = (height, width) => `${(height / width) * 100}%`


export {
  resizeToFill,
  resizeToFit,
  resizeImage,
  fileToImageDataURL,
  imageToDataURL,
  fileToImage,
  loadImage,
  deanimateImage,
  aspectRatioToTopPadding,
}
