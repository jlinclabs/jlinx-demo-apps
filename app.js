const Path = require('path')
const { URL } = require('url')
const crypto = require('crypto')
const express = require('express')
const Router = require("express-promise-router")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const hbs = require('express-hbs')
const jwt = require('jsonwebtoken')
const QRCode = require('qrcode')
const { now, createRandomString } = require('jlinx-util')
const requestInfo = require('request-info')

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
app.set('trust proxy', true) // TODO review this. did it to get req.ip
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
  const { session } = req
  console.log('SESSION', session)
  session.touch()
  let currentUser
  if (session.userId){
    currentUser = await app.users.findById(session.userId)
    if (!currentUser){
      console.log('DESTROYING SESSION')
      session.destroy()
      return res.status(401).redirect('/')
    }
  }
  console.log({ currentUser })

  Object.assign(req, {
    currentUser
  })
  Object.assign(res.locals, {
    currentUser,
  })

  console.log('REQ METHOD', [req.method])
  if (
    currentUser &&
    !currentUser.username &&
    req.method === 'GET' &&
    req.url !== '/logout'
  ){
    return res.render('complete-account', {
      destination: req.url,
    })
  }

  next()
})

router.get('/', async (req, res) => {
  res.render('index', {
    users: await app.users.all(),
  })
})


router.get('/signup', (req, res) => {
  res.render('signup')
})

router.post('/signup-with-jlinx', async (req, res) => {
  const followupUrl = new URL(
    '/signup-with-jlinx/followup',
    `${req.protocol}://${req.get('host')}`
  ).toString()
  // const followupUrl = req.url + '/signup-with-jlinx/followup'
  const appUser = await app.jlinx.createAppUser({
    followupUrl,
  })
  appUser.update()
  console.log(
    '\n\n!!!CREATED APP USER',
    appUser,
    await appUser._value
  )
  // TODO persist appUser in postgres
  const qrcodeDataUri = await QRCode.toDataURL(appUser.id)
  res.render('signup-with-jlinx', {
    appUserId: appUser.id,
    qrcodeDataUri,
  })
})

router.get('/signup-with-jlinx/wait', async (req, res) => {
  const { id: appUserId } = req.query
  const appUser = await app.jlinx.get(appUserId)
  await appUser.update()

  while (appUser.state !== 'open'){
    console.log(
      'WAITING FOR AppUser offering to be accepted',
      appUser,
    )
    await appUser.waitForUpdate()
    await appUser.update()
  }

  console.log(
    'AppUser just opened!',
    appUser,
    appUser.userMetadata,
  )
  const { userId } = appUser.userMetadata

  let user
  if (userId) user = await app.users.findById(userId)

  console.log({ user })
  if (user){
    // login user
    req.session.userId =userId
    console.log('SIGNUP COMPLETE SUCCEESS', req.session)
    res.status(200).end()
  }else{
    res.status(400).end()
  }
})

router.post('/signup-with-jlinx/followup', async (req, res) => {
  try{
  console.log('BODY', req.body)
  const { appAccountId } = req.body
  console.log('signup-with-jlinx/followup', { appAccountId })
  const appAccount = await app.jlinx.get(appAccountId)
  await appAccount.update()
  console.log('signup-with-jlinx/followup', {
    appAccount,
    _value: appAccount._value
  })

  const { appUserId } = appAccount
  console.log('signup-with-jlinx/followup', { appUserId })
  if (!appUserId){
    throw new Error(`unable to find appUserId`)
  }

  const appUser = await app.jlinx.get(appUserId)
  await appUser.update()

  console.log('\n\n\nFINIALIZING NEW USER ACCOUNT :D', {
    appAccount,
    appUser,
    'appAccount.appUserId': appAccount.appUserId,
    'appUser.id': appUser.id,
    'appAccount.signupSecret': appAccount.signupSecret,
    'appUser.signupSecret': appUser.signupSecret,
  })

  if (
    appAccount.appUserId === appUser.id &&
    appAccount.signupSecret === appUser.signupSecret
  ){
    // create user record
    const user = await app.users.create({
      jlinxAppUserId: appUserId,
      // other data can go here
    })
    await appUser.openAccount({
      appAccountId,
      userMetadata: {
        userId: user.id,
      },
    })
    // create session in the other tab that was waiting for us
    res.status(200).json({})
  }else{
    res.status(400).json({})
  }
  }catch(error){
    console.error('signup-with-jlinx/followup ERROR', error)
    res.status(500).json({
      error: `${error}`,
      trace: error.trace,
      stack: error.stack,
    })
  }
})

router.post('/complete-account', async (req, res) => {
  const { destination, username } = req.body
  await req.currentUser.update({ username })
  res.redirect(destination)
})

router.get('/login', async (req, res) => {
  res.render('login')
})

router.post('/login', async (req, res) => {
  const { username } = req.body
  const user = await app.users.findByUsername(username)
  console.log('POST /login', { user })
  if (user.jlinxAppUserId){
    const appUser = await app.jlinx.get(user.jlinxAppUserId)
    await appUser.update()
    console.log('POST /login', 'requesting session for', appUser)
    const sourceInfo = requestInfo(req)
    await appUser.requestSession({
      sourceInfo: {
        ip: sourceInfo.ip,
        ua: sourceInfo.ua,
      }
    })
    res.render('login-with-jlinx')
  // else if (user has a password)
    // then render a page prompting for a password
  }else{
    res.render('login-with-password')
  }
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
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
  console.error('ERROR', error)
  res.render('error', { error })
})
