import Debug from 'debug'
import Path from 'path'
import express from 'express'
import Router from 'express-promise-router'

import ceramic, {
  TileDocument,
  resolveDidDocument
} from './ceramic.js'

const debug = Debug('ceramic api')
const router = Router()

router.get('/api/ceramic/did::did*', async (req, res) => {
  const did = 'did:' + req.params.did
  const didDocument = await resolveDidDocument(did)
  res.json(didDocument)
})

router.get('/api/ceramic/:streamId', async (req, res) => {
  const { streamId } = req.params
  const doc = await TileDocument.load(ceramic, streamId)
  res.json(doc.content)
})

router.get('/api/ceramic/:streamId/meta', async (req, res) => {
  const { streamId } = req.params
  const doc = await TileDocument.load(ceramic, streamId)
  res.json({
    id: doc.id,
    // api: doc.api,
    content: doc.content,
    tip: doc.tip,
    commitId: doc.commitId,
    allCommitIds: doc.allCommitIds,
    anchorCommitIds: doc.anchorCommitIds,
    state: doc.state,
  })
})

router.get('/api/ceramic/:streamId/stream', async (req, res) => {
  let closed = false
  req.on('close', function () {
    closed = true
    // doc.close()
  })
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive'
  })

  res.flushHeaders()
  // await doc.update()

  let cursor = 0
  while (true) {
    if (closed) break
    while (cursor < doc.length) {
      if (closed) break
      let entry = await doc.get(cursor)
      debug('STREAM', { i: cursor, entry })
      try {
        entry = JSON.stringify(JSON.parse(entry), null, 2)
      } catch (e) {}
      res.write(entry)
      res.write('\n')
      cursor++
    }
    if (closed) break
    await doc.waitForUpdate(cursor)
  }

})

export default router
