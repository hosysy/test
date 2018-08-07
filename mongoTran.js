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

    const session = await BalanceHistory.startSession()

    session.startTransaction()

    try {
      console.log('test--1')
      await BalanceHistory.findOneAndUpdate(
        { accountId: '214727000' },
        { $inc: { beforeBalance: 100 } },
        { upsert: true, new: true, session }
      )
      console.log('test--2')

      await Pricing.findOneAndUpdate(
        { accountId: '214727000' },
        { $set: { contryId: '82', coutnryName: 'wow' } },
        { upsert: true, new: true, session }
      )

      console.log('test--3')
      await session.commitTransaction()
      console.log('test--4')
      session.endSession()
      console.log('test--5')
      return true
    } catch (err) {
      console.error(err)
      await session.abortTransaction()
      session.endSession()
      throw err
    }

    
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
