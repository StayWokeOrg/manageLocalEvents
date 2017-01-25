const express = require('express'),
  // NOTE: require in our request proxy module
  requestProxy = require('express-request-proxy'),
  port = process.env.PORT || 3000,
  app = express()

const twilio = require('twilio')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./'))
const eventModel = require('./scripts/zipLookupSMS.js')

app.get('*', function (request, response) {
  console.log('New request:', request.url)
  response.sendFile('index.html', { root: '.' })
})

// steps is the list of callbacks a user will progress through
const steps = {
  0: initial,
  1: zip,
  2: bye,
}

// stores steps a user is at
const storage = {}

// TODO: Decide on actual flow, maybe text the closest five?
app.post('/sms', (req, res) => {
  const from = req.body.From
  const session = storage[from] || { step: 0 }
  steps[session.step](req, res, session).then(function (twiml) {
    session.step ++
    storage[from] = session
    console.log('session:', session)
    console.log('storage:', storage)
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    res.end(twiml.toString())
  })
})

function initial (req, res, session) {
  const twiml = new twilio.TwimlResponse()
  twiml.message('hey there, whats your zip?')
  session.campaign = req.body.Body
  return new Promise(function (resolve, reject) {
    resolve(twiml)
  })
}

function zip(req, res, session) {
  const twiml = new twilio.TwimlResponse()
  session.zip = req.body.Body
  return new Promise(function (resolve, reject) {
    eventModel.lookupZip(session.zip).then(function (response) {
      session.event = response
      console.log('session.event', session.event)
      twiml.message(`The cloest event to you is ${session.event.name}, at ${session.event.time}, on ${session.event.date}`)
      resolve(twiml)
    })
  })
}

function bye(req, res, session) {
  const twiml = new twilio.TwimlResponse()
  session.zip = req.body.Body
  twiml.message('Awesome, we will be in touch')
  // todo persist to an external data store?
  console.log('SAVE:', session)
  return new Promise(function (resolve, reject) {
    resolve(twiml)
  })
}

app.listen(port, function () {
  console.log(`Server started on port ${port}`)
})
