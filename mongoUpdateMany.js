let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Pricing, BalanceHistory } = require('./models')
const mongoose = require('mongoose')

async function funB() {
  try {
    const conn = await mongoose.connect(`mongodb://localhost:27017/test2`, {
      autoReconnect: true,
      reconnectTries: 10,
      reconnectInterval: 100
    })

    await Pricing.remove()

    const list = []

    for (let i = 0; i < 10000; i++) {
      list.push({ accountId: 'test', countryId: i, countryName: `country_{$i}`, sms: Number(i) })
    }

    await Pricing.insertMany(list)

    const res = await Pricing.find()
    // console.log(`---------- CHECK res ----------`, res)


    const result = await Pricing.updateMany({ accountId: 'test' }, { $inc: { sms: 10000 } })
    console.log(`---------- CHECK result ----------`, result)

    // console.log(await Pricing.find())
    console.log('Success')
    mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongoose.connection.close()
  }
}

funB()
