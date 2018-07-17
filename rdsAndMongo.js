let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const Pricing = require('./models/pricing')
const mysql = require('mysql')
let connection

async function funA(items) {
  const insertData = []

  items.map((item) => {
    const obj = {
      _id: item.prefix,
      countryId: item.prefix,
      countryName: item.country_name,
      sms: item.sms,
      lms: item.lms,
      mms: item.mms
    }

    if (item.prefix === '82') {
      obj.ata = 19
      obj.cta = 13
    }

    insertData.push(obj)
  })

  try {
    await Pricing.remove({})
    await Pricing.insertMany(insertData)
  } catch(err) {
    console.log('check err', err)
  }
}

async function funB() {
  try {
    await mongo.init({'host':'localhost', "database": "test2"})
    connection = mysql.createConnection({
      host: 'localhost',
      user: 'coolsms',
      password: 'nurigo0401',
      database: 'coolsms'
    })
    connection.connect()

    const res = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM coverage', function (error, results, fields) {
        if (error) throw error
        resolve(results)
      })
    })

    await funA(res)

    console.log('Success')
    mongo.mongoose.connection.close()
    connection.end()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
