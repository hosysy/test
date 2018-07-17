const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message } = require('@nurigo/mongo/models')

async function scan() {
  return new Promise((resolve, reject) => {
    return resolve()
  })
}

setInterval(() => {
  scan().catch(console.error)
}, 1000)

