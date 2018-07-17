'use strict'

const mongoose = require('mongoose')
const { Client } = require('./models')


var mongoCli

async function connect() {
  mongoCli = await mongoose.connect('mongodb://localhost/test')
}

function start() {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await connect()
        console.log('check', mongoCli.connection.readyState)
        const result = await Client.collection.findOneAndUpdate({ "approvedUserCount": 0 }, { $set: { "approvedUserCount": 1} })
        if (!result.lastErrorObject.updatedExisting) console.log('FAIL TO UPDATING')
        console.log('----------- CHECK result -----------', result)
        await mongoose.connection.close()
        console.log('SUCCESS')
        resolve()
      } catch (err) {
        await mongoose.connection.close()
        console.log('FAIL')
        reject(err)
      }
    }, 500)
  })
}

async function run() {
  while (true) {
    await start()
  }
}


try {
  run()
} catch (err) {
  console.log('check err', err)
}
