'use strict'

const mongoose = require('mongoose')
const { Client } = require('./models')


var mongoCli

async function connect() {
  mongoCli = await mongoose.connect('mongodb://localhost/pm2test')
}

function start() {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log('check NODE_ENV', process.env.NODE_ENV)
        console.log('check', mongoCli.connection.readyState)
        let result = await Client.collection.findOneAndUpdate(
          { count: 0 },
          { $set: { count: 1 } }
        )
        console.log(result)
        console.log('SUCCESS')
        resolve()
      } catch (err) {
        console.log('FAIL')
        reject(err)
      }
    }, 500)
  })
}

async function run() {
  try {
    await connect()
    while (true) {
      await start()
    }
    await mongoose.connection.close()
  } catch (err) {
    console.error(`---------- CHECK err ----------`, err)
    await mongoose.connection.close()
  }
}

// graceful stop
process.on('SIGINT', async () => {
  console.log(`---------- CHECK SIGINT ----------`)
  await mongoose.connection.close()
  process.exit()
})

process.on('uncaughtException', function(e) {
   try {
    run()
  } catch (err) {
    console.log('check err', err)
    throw err
  } 
})


try {
  run()
} catch (err) {
  console.log('check err', err)
  throw err
}
