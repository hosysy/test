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
    await new Pricing({
      _id: 'a',
      sms: 100,
      countryId: 'a',
      countryName: 'b',
      count: { a: 1, b: 2 }
    }).save()
    await new Pricing({
      _id: 'b',
      sms: 100,
      countryId: 'a',
      countryName: 'b',
      count: { a: 1, b: 2 }
    }).save()
    await new Pricing({
      _id: 'c',
      sms: 100,
      countryId: 'a',
      countryName: 'b',
      count: { a: 1, b: 2 }
    }).save()

    let type = 'LMS'
    const key = `count.${type.toLowerCase()}.82`
    console.log(`---------- CHECK key ----------`, key)

    const $inc = {}
    $inc[key] = 1
    console.log(`---------- CHECK $inc ----------`, $inc)

    const res = await Pricing.updateOne({ sms: 100 }, {
      $set: {
        sms: 300
      },
      $inc
    })
    console.log(`---------- CHECK res ----------`, res)
    if (!res.n) console.error('testERROR')

    /*
    await Pricing.findOneAndUpdate({ cash: 1000 }, {
      $set: {
        cash: 1500
      }
    }, { upsert: true })
    */

    // await Pricing.createNew()


    // await Pricing({ point: 500 }).save()

    console.log(require('util').inspect(await Pricing.find(), { depth: 5 }))
    /*
    const res1 = await Pricing.updateOne({
      countryId: '82'
    }, {
      $inc: { sms: 1 },
      $set: { coutnryName: 'wow' }
    }, {
      upsert: true
    })

    console.log(require('util').inspect(res1, { depth: 5 }))
    console.log(await Pricing.find())

    const res2 = await Pricing.updateOne({ countryId: '82' }, { $inc: { sms: 1 }, $set: { coutnryName: 'wow' } }, { upsert: true })
    console.log(require('util').inspect(res2, { depth: 5 }))

    console.log(await Pricing.find())

    const res3 = await Pricing.updateOne({ countryId: '82' }, { $inc: { sms: 'test' }, $set: { coutnryName: 'wow' } }, { upsert: true })
    console.log(require('util').inspect(res3, { depth: 5 }))

    const res4 = await Pricing.updateOne({ countryId: '82' }, { $inc: { sms: 1 }, $set: { coutnryName: true } }, { upsert: true })
    console.log(require('util').inspect(res4, { depth: 5 }))

    */


    
    // mongo.createCollection('balancehistories')
    /*
    mongo.collection.createCollection('balancehistories').
      then(() => db.startSession()).
      then(_session => {
        session = _session
        session.startTransaction()
        return BalanceHistory.create([{
          accountId: '214727',
          beforeBalance: 0,
          afterBalance: 100,
          amount: 100,
          type: 'DEDUCT',
          dateCreated: new Date('2018-09-20 13:40:13')
        }], { session: session })
      }),
      then(() => BalanceHistory.findOne({ accountId: '214727' })).
      then(doc => assert.ok(doc)).
      then(() => session.commitTransaction()).
      then(() => BalanceHistory.findONe({ accountId: '214727' })).
      then(doc => assert.ok(doc))
    */

    /*const lastMonth = moment().subtract(2, 'month')
    const startDate = lastMonth.clone().startOf('month')
    const endDate = lastMonth.clone().endOf('month')
    console.log('check', startDate, endDate)
    console.log('check 2', new Date(startDate), new Date(endDate))*/

    /*console.log(c.getMonth())
    c.setMonth('06')

    console.log(moment())
    console.log(new Date())
    console.log(new Date(moment().add(-1, 'month')))
    console.log(c)*/

    /*
    const statisticsObj = {}
    const statisticsList = await getArg()
    for (const data of statisticsList) {
      const { _id: { accountId, type }, totalAmount } = data

      console.log(`---------- CHECK data ----------`, accountId, type, totalAmount)
      statisticsObj[accountId] = 0
      if (type.toUpperCase() === 'RECHARGE') statisticsObj[accountId] -= Number(totalAmount)
      else statisticsObj[accountId] += Number(totalAmount)
    }
    console.log(`---------- CHECK statisticsObj ----------`, statisticsObj)
    */

    // console.log('chek', a.totalAmount)

    // await funA()

    // await funC('G4V20180307105937FFFFFFFFFEDULE0')

    console.log('Success')
    mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongoose.connection.close()
  }
}

funB()
