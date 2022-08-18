import Debug from 'debug'
import Path from 'path'
import express from 'express'
import Router from 'express-promise-router'
// import * as IPFS from 'ipfs-core'
// const ipfs = await IPFS.create()

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
    id: doc.id.toString(),
    // api: doc.api, // circular JSON
    content: doc.content,
    tip: doc.tip.toString(),
    commitId: doc.commitId.toString(),
    allCommitIds: doc.allCommitIds.map(id => id.toString()),
    anchorCommitIds: doc.anchorCommitIds.map(id => id.toString()),
    state: {
      ...doc.state,
      log: doc.state.log.map(entry => ({...entry, cid: entry.cid.toString()}))
      // anchorProof: doc.state.anchorProof
    },
    metadata: doc.metadata,
    controllers: doc.controllers,
    isReadOnly: doc.isReadOnly,
  })
})

router.get('/api/ceramic/:streamId/events', async (req, res) => {
  const { streamId } = req.params
  const doc = await TileDocument.load(ceramic, streamId)

  let closed = false
  let subscription
  req.on('close', function () {
    closed = true
    if (subscription) subscription.unsubscribe()
  })
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive'
  })

  res.flushHeaders()

  let cursor = 0
  async function writeNewEvents(){
    if (closed) return
    await doc.sync()
    const commitIds = [...doc.allCommitIds].slice(cursor)
    while (commitIds.length > 0){
      const commitId = commitIds.shift()
      const stream = await ceramic.loadStream(commitId)
      let json
      try {
        json = JSON.stringify(stream.content, null, 2)
      } catch (error) {
        json = `{"__JSON_ERROR__": "${error}"}`
      }
      res.write(json)
      res.write('\n')
      cursor++
    }
  }

  await writeNewEvents()

  subscription = doc.subscribe((...args) => {
    if (closed) return
    writeNewEvents().catch(error => {
      console.error(error)
      res.end()
    })
  })
})

export default router
