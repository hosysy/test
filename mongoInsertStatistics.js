let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Statistics } = require('./models')

async function funA() {
  await Statistics.remove()
  const date = new Date()
  date.setDate(date.getDate() - 3)
  date.setSeconds(0)
  date.setMilliseconds(0)

  console.log(`---------- CHECK date ----------`, date)
  const data = [
    {
      accountId: '214727',
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
      point: 200
    }
  ]

  for (let i = 1; i < 10000; i++) {
    const keyDate = new Date(data[0].date.getTime())
    keyDate.setMilliseconds(+i)
    data.push(Object.assign({}, data[0], { date: keyDate }))
  }

  for (let i = 10000; i < 15000; i++) {
    const keyDate = new Date(data[0].date.getTime())
    keyDate.setMilliseconds(+i)
    data.push(Object.assign({}, data[0], { date: keyDate, accountId: '9999', count: { '3033': { 'sms': 10 } } }))
  }

  for (let i = 15000; i < 20000; i++) {
    const keyDate = new Date(data[0].date.getTime())
    keyDate.setMilliseconds(+i)
    data.push(Object.assign({}, data[0], { date: keyDate, appId: 'K33791', count: { '4000': { 'lms': 100 } } }))
  }

  /*
  for (let i = 0; i < 5000; i++) {
    data.push(Object.assign({}, data[0], { accountId: i, count: {
      '2011': { 'sms': 100, 'ata': 50 },
      '2012': { 'sms': 1000, 'ata': 50 },
      '2013': { 'sms': 2000, 'ata': 50 },
      '2014': { 'sms': 3000, 'ata': 50 },
      '2015': { 'sms': 4000, 'ata': 50 },
      '2016': { 'sms': 5000, 'ata': 50 },
      '2017': { 'sms': 6000, 'ata': 50 },
      '2018': { 'sms': 7000, 'ata': 50 },
      '2019': { 'sms': 8000, 'ata': 50 },
      '2020': { 'sms': 9000, 'ata': 50 },
      '2021': { 'sms': 1000, 'ata': 50 },
      '2022': { 'sms': 200, 'ata': 50 },
      '2023': { 'sms': 300, 'ata': 50 },
      '2024': { 'sms': 400, 'ata': 50 },
      '2025': { 'sms': 500, 'ata': 50 },
      '2026': { 'sms': 600, 'ata': 50 },
      '2027': { 'sms': 700, 'ata': 50 },
      '4000': { 'sms': 10, 'ata': 50 }
    } }))
  }
  */


  try {
    console.log('data.length : ', data.length)
    await Statistics.insertMany(data)
  } catch(err) {
    console.log('check err', err)
  }
}

async function test() {
  try {
    await mongo.init({'host':'localhost', "database": "msgv4"})

    await funA()

    console.log('check items count')
    console.log(await Statistics.count())

    console.log('Success')
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

test()
