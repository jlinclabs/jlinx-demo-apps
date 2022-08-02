import Path from 'path'
import express from 'express'
import Router from 'express-promise-router'
import multer from 'multer'
import uuid from 'uuid/v1.js'

const MOUNT_POINT = '/api/uploads'
const UPLOADS_PATH = process.env.UPLOADS_PATH
if (!UPLOADS_PATH){
  console.error(`invalid UPLOADS_PATH "${UPLOADS_PATH}"`)
  process.exit(1)
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_PATH);
    },
    filename: function (req, file, cb) {
      const extension = Path.extname(file.originalname);
      const filename = `${uuid()}${extension}`;
      console.log(`WRITING UPLOAD "${filename}"`);
      cb(null, filename);
    },
  })
})

const router = Router()

router.post(`${MOUNT_POINT}`,
  upload.single('file'),
  async function(req, res){
    console.log('UPLOADING FILE', req.file)
    const url = `${req.get('origin')}${MOUNT_POINT}/${req.file.filename}`
    console.log('CREATED UPLOAD', { url })
    res.json({ url });
  }
)

router.use(`${MOUNT_POINT}`, express.static(UPLOADS_PATH))

export default router
