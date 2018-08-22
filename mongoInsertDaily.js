let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { DailyStatistics } = require('./models')

async function funA() {
  await DailyStatistics.remove()
  const date = new Date()
  date.setDate(0)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)

  const data = []
  const baseData = {
    accountId: '1',
    appId: 'test',
    date,
    count: {
      '4000': {
        'sms': 1,
        'lms': 1,
        'mms': 1,
        'ata': 1,
        'cta': 1
      },
      '3000': {
        'sms': 1,
        'lms': 1,
        'mms': 1,
        'ata': 1,
        'cta': 1
      },
      '3034': {
        'sms': 10,
        'lms': 20,
        'mms': 30,
        'ata': 40,
        'cta': 50
      }
    },
    balance: 100,
    point: 200,
  }

  for (let o = 0; o < 1000; o++) {
    const accountId = `1${o}`
    if (o === 499) console.log('accountId', accountId)

    for (let i = 1; i < 32; i++) {
      const keyDate = new Date(baseData.date.getTime())
      keyDate.setDate(i)
      data.push(Object.assign({}, data[0], { date: keyDate, count: { '3033': { 'sms': 10, 'lms': 10, 'mms': 5 } }, taxIssued: false }))
    }

    for (let i = 1; i < 32; i++) {
      const keyDate = new Date(baseData.date.getTime())
      keyDate.setDate(i)
      data.push(Object.assign({}, data[0], { date: keyDate, appId: 'K33791', count: { '4000': { 'ata': 100, 'cta': 300 } }, taxIssued: false }))
    }

  }
  let startDate = new Date(baseData.date.getTime())
  startDate.setDate(1)
  let endDate = new Date(baseData.date.getTime())
  console.log('check start', startDate)
  console.log('end start', endDate)

  try {
    console.log('data.length : ', data.length)
    await DailyStatistics.insertMany(data)
  } catch(err) {
    console.log('check err', err)
  }
}

async function test() {
  try {
    await mongo.init({'host':'localhost', "database": "temp3"})

    await funA()

    console.log('check items count')
    console.log(await DailyStatistics.count())

    console.log('Success')
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

test()
