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

// 카운트 계산
  await Promise.all(_.flatMap(data, obj => {
    return new Promise((resolve, reject) => {
      if (obj.statusCode === '2000') {
        const messageType = obj.type.toLowerCase()

        let key = `countForCharge.${messageType}`

        // ata, cta의 경우는 그냥 카운트를 올려주고 나머지는 국가코드별로 구분해서 올려준다.
        if (messageType === 'ata' || messageType === 'cta') {
          countForLog[messageType] = messageType in countForLog ? countForLog[messageType]++ : 1
        } else {
          console.log('IN--1')
          console.log(obj.to)
          console.log(obj.country)
          console.log(typeof obj.country)
          const country = obj.country || '82'
          console.log(countForLog)
          console.log(`---------- CHECK country in countForLog[messageType] ----------`, country in countForLog[messageType])
          countForLog[messageType][country] = country in countForLog[messageType]
            ? countForLog[messageType][country]++ : 1
          console.log(countForLog)
          key += `.${country}`
        }
        updateData['$inc'][key] = key in updateData['$inc'] ? updateData['$inc'][key]++ : 1
        updateData['$inc']['count.registeredSuccess']++
        logFlag = true
      } else {
        updateData['$inc']['count.registeredFailed']++
      }
      resolve()
    })
  }))
