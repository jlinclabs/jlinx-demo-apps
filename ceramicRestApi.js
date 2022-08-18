import Debug from 'debug'
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
    id: doc.id.toString(),
    // api: doc.api, // circular JSON
    controllers: doc.controllers,
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

  let lookingForNewEvents = false
  async function lookForNewEvents(){
    if (closed) return
    if (lookingForNewEvents) {
      await lookingForNewEvents
      await lookForNewEvents()
    }else{
      lookingForNewEvents = writeNewEvents().catch(error => {
        closed = true
        console.error(error)
        res.end()
      })
      await lookingForNewEvents
      lookingForNewEvents = null
    }
  }

  let cursor = 0
  async function writeNewEvents(){
    if (closed) return
    const allCommitIds = [...doc.allCommitIds]
    const newCommits = allCommitIds.slice(cursor)
    if (newCommits.length === 0) return
    cursor = allCommitIds.length
    while (newCommits.length > 0){
      const commitId = newCommits.shift()
      const stream = await ceramic.loadStream(commitId)
      let json
      try {
        json = JSON.stringify(stream.content, null, 2)
      } catch (error) {
        json = `{"__JSON_ERROR__": "${error}"}`
      }
      res.write(json)
      res.write('\n')
    }
  }

  subscription = doc.subscribe(lookForNewEvents)
})

export default router
