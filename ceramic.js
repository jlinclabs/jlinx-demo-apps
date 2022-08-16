import crypto from 'crypto'
import env from './environment.js'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'

// Connect to a Ceramic node
// const API_URL = 'https://cas-clay.3boxlabs.com'
// const API_URL = 'https://ceramic-clay.3boxlabs.com'
// const API_URL = 'https://gateway-clay.ceramic.network'
// const API_URL = 'http://0.0.0.0:7007'
const API_URL = env.CERAMIC_API_URL

const ceramic = new CeramicClient(API_URL)

async function createDid(){
  const seed = Buffer.alloc(32)
  crypto.randomFillSync(seed)
  const did = getDid(seed)
  return { did, seed }
}

async function getDid(seed){
  const provider = new Ed25519Provider(seed)
  const did = new DID({ provider, resolver: getResolver() })
  await did.authenticate()
  return did
}

export default ceramic
export {
  TileDocument,
  createDid,
  getDid,
}



// async function authenticateCeramic(seed) {
//   // Activate the account by somehow getting its seed.
//   // See further down this page for more details on
//   // seed format, generation, and key management.
//   const provider = new Ed25519Provider(seed)
//   // Create the DID object
//   const did = new DID({ provider, resolver: getResolver() })
//   // Authenticate with the provider
//   await did.authenticate()
//   // Mount the DID object to your Ceramic object
//   ceramic.did = did
// }

// async function main () {
//   // did:key:z6MkhSJKV8xg3Lj4zSXHyqNd51EZMrkWQHKyHsRNQvmfFCjT
//   const seed = Buffer.from('593df14c304756ba60c85136acd4aeab36153e55944a2a011eb2ea7fe5f8b00f', 'hex')
//   console.log('authenticating')
//   await authenticateCeramic(seed)
//   console.log('authenticated as', ceramic.did.id)

//   const [command, ...args] = process.argv.slice(2)
//   console.log(command, ...args)

//   if (command === 'create'){
//     const doc = await TileDocument.create(ceramic, args[0])
//     console.log('create', doc.id)
//   } else if (command === 'watch'){
//     const doc = await TileDocument.load(ceramic, args[0])
//     console.log('loaded', doc.id)
//     doc.subscribe((...args) => {
//       console.log('CHANGE', args, doc)
//       console.log(doc.content)
//     })
//   } else if (command === 'update'){
//     const doc = await TileDocument.load(ceramic, args[0])
//     console.log('loaded', doc.id)
//     await doc.update(args[1])
//   }else{
//     throw new Error(`unknown command "${command}"`)
//   }

//   // console.log('loading stream')
//   // const stream = await ceramic.loadStream('kjzl6cwe1jw14al2qy3pa50ibes40em1p1knnnpf6jj7ranfugbwwp3ovy8ihmy')
//   // console.log({
//   //   stream,
//   //   id: stream.id,
//   //   commitId: stream.commitId,
//   //   anchorCommitIds: stream.anchorCommitIds,
//   // })

//   // console.log(process.env.ARGV)

//   // const x = stream.subscribe((...args) => {
//   //   console.log('SUB HANDLER CALLER', args)

//   // })
//   // console.log('SUB RET V', x)
// }

// main().catch(error => {
//   console.error(error)
//   process.exit(1)
// })
