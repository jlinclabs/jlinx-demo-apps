const Path = require('path')
const crypto = require('crypto')
const express = require('express')
const Router = require("express-promise-router");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const hbs = require('express-hbs')
const jwt = require('jsonwebtoken')
const QRCode = require('qrcode')

const app = express()
module.exports = app
app.config = require('./appConfig')
app.jlinx = require('./jlinx')
app.pg = require('./postgresql')
app.users = require('./models/User')

const appName = app.config.name

hbs.handlebars.registerHelper('toJSON', object =>
  new hbs.handlebars.SafeString(JSON.stringify(object, null, 2))
)

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ }))
app.use(cookieParser())
app.use(expressSession({
  secret: app.config.sessionSecret,
  resave: true,
  saveUninitialized: true,
}))

// VIEWS
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials',
  defaultLayout: __dirname + '/views/layout/default.hbs',
}))
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')
Object.assign(app.locals, {
  appName,
  appColor: app.config.color,
  // TODO move this static lists
  // partnerApps: app.config.partnerApps,
})

app.start = async function start(){
  // await app.pg.connect()
  // await app.hl.connect()
  const startHttpServer = () =>
    new Promise((resolve, reject) => {
      app.server = app.listen(app.config.port, error => {
        if (error) return reject(error);
        console.log(`${appName} listening on port ${app.config.port} at ${app.config.url}`)
        resolve();
      })
    })

  await Promise.all([
    // app.sequelize.authenticate(),
    app.pg.ready(),
    app.jlinx.ready(),
    startHttpServer()
  ])
}

// ROUTES
const router = Router()
app.use(router)

router.use('*', async (req, res, next) => {
  console.log('SESSION', req.session)
  // const sessionJwt = req.cookies[COOKIE_NAME]
  // let session
  // if (sessionJwt){
  //   try{
  //     session = await verifySession(sessionJwt)
  //   }catch(error){
  //     res.cookie('session', null)
  //   }
  // }

  // let currentUser
  // if (session) {
  //   currentUser = await app.users.get(session.username)
  //   if (!currentUser){
  //     res.status(401).clearCookie(COOKIE_NAME).redirect('/')
  //     return
  //   }
  // }

  // Object.assign(res.locals, { session, currentUser })

  next()
})

router.get('/', async (req, res) => {
  res.render('index', {
    users: await app.users.all(),
  })
})

router.get('/login', async (req, res) => {
  res.render('login')
})

router.post('/login', async (req, res) => {
  res.redirect('/')
})

router.get('/jlinx-login', async (req, res) => {
  await app.jlinx.server.connected()
  await app.jlinx.server.hypercore.hasPeers()
  // TODO make an account, not a DID
  // i.e. const jlinxAppAccount = jlinx.create

  // MOVE ME TO jlinx-app
  // create a new ledger
  const signingKeyPair = await app.jlinx.server.keys.createSigningKeyPair()
  const publicKey = signingKeyPair.publicKeyAsString
  // const core = await this.hypercore.getCore(signingKeyPair.publicKey, signingKeyPair.secretKey)
  // write account and app information to ledger (signed by app public key?)
  // await core.append()
  // verify signature by getting the agent public key from `${PROVIDED_JLINX_API_URL}/publickey`

  // const didDocument = await app.jlinx.createDid()
  // const publicKey = didDocument.id.split(':')[2]
  console.log({ publicKey })
  const qrcodeDataUri = await QRCode.toDataURL(publicKey)
  res.render('jlinx_login', {
    publicKey, qrcodeDataUri
  })
})

router.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get('/signup', (req, res) => {
  res.render('signup')
})

router.post('/signup', async (req, res) => {
  const { username, realname } = req.body
  const user = await app.users.create({ username, realname })
  createSessionCookie(res, user.username, `/@${user.username}`)
})

router.get('/@:username', async (req, res) => {
  const { currentUser } = res.locals
  const { username } = req.params
  const itsUs = currentUser && currentUser.username === username
  const user = itsUs ? currentUser : (await app.users.get(username))
  const hyperlincEvents = user && await app.users._getAllHyperlincEvents(username)
  res.render('profile', {
    username, itsUs, user, hyperlincEvents
  })
})

router.post('/profile', async (req, res) => {
  const { username } = res.locals.currentUser
  const changes = req.body
  await app.users.updateProfile(username, changes)
  res.redirect(`/@${username}`)
})

// router.get('/send-me-to', (req, res) => {
//   const { currentUser } = res.locals
//   const appUrl = req.query.app
//   res.redirect(`${appUrl}/hyper-login?hlid=${currentUser.hyperlinc_id}`)
// })

// router.get('/hyper-login', async (req, res) => {
//   const hyperlincId = req.query.hlid
//   const user = await app.users.findByHyperlincId(hyperlincId)
//   if (user) return createSessionCookie(res, user.username)

//   const [hlProfile] = await app.hl.getProfiles([hyperlincId])
//   if (hlProfile){
//     if (hlProfile.preferredUsername){
//       const user = await app.users.create({
//         username: hlProfile.preferredUsername,
//         hyperlincId,
//       })
//       return createSessionCookie(res, user.username)
//     }
//     const hyperlincStatus = await app.hl.status()
//     return res.render('hypersignup', {
//       hyperlincId, hlProfile, hyperlincStatus
//     })
//   }
//   res.render('error', { error: { message: 'didnt work :(' }})
// })

// router.post('/hyper-signup', async (req, res) => {
//   const { hlid: hyperlincId, username } = req.body
//   const user = await app.users.create({ username, hyperlincId })
//   return createSessionCookie(res, user.username)
// })

// router.post('/zcap-signup', async (req, res) => {
//   const { jlincDid, username } = req.body
//   const user = await app.users.create({ username, jlincDid })
//   return createSessionCookie(res, user.username)
// })

// router.get('/__hyperlinc/:id', async (req, res) => {
//   const { id } = req.params
//   const identity = await app.hl.getIdentity(id)
//   await identity.update()
//   const hyperlincEvents = await identity.getAllEvents()
//   const writable = (
//     await app.pg.query(
//       `
//       SELECT 1
//       FROM hyperlinc_secret_keys
//       WHERE hyperlinc_id = $1
//       `,
//       [id]
//     )
//   ).rowCount > 0
//   res.render('hyperlinc_events', {
//     writable,
//     hyperlincEvents,
//   })
// })

router.get('/jlinx/status', async (req, res) => {
  await app.jlinx.server.ready()
  const status = await app.jlinx.server.hypercore.status()
  res.json(status)
})

router.get('/dids/resolve', async (req, res) => {
  const { did } = req.query
  const didDocument = did && await app.jlinx.resolveDid(did)
  res.render('dids/resolve', { did, didDocument })
})


router.use((error, req, res, next) => {
  res.render('error', { error })
})
