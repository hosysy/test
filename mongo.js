let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message, BalanceHistory } = require('@nurigo/mongo/models')

async function funA() {
  let id = createMessageId()
  let groupId = 'G4V20180307105937FFFFFFFFFEDULE0'
  let messages = [
    {
      "_id": id,
      "messageId": id,
      groupId,
      "to": "01090683469",
      "from": "029302266",
      "text": "test",
      "type": "LMS",
      "schuledDate": new Date("2018-09-20 13:40:13"),
      "subject": "TEST",
      "kakaoOptions": {
        "senderKey": "test",
        "templateCode": "test",
        "buttonName": "test",
        "buttonUrl": "test",
        "disableSms": "true"
      },
      "statusCode": "4000"
    }
  ]

  const balanceHistory = [
    {
      accountId: '214727',
      beforeBalance: 0,
      afterBalance: 100,
      amount: 100,
      type: 'DEDUCT',
      dateCreated: new Date('2018-09-20 13:40:13')
    }
  ]

  for (let i = 0; i < 300000; i++) {
    if (i < 10000) balanceHistory.push(Object.assign({}, balanceHistory[0], { accountId: '2123123', type: 'RECHARGE', dateCreated: new Date('2018-02-20 13:40:13') }))
    if (i > 10000 && i < 30000) balanceHistory.push(Object.assign({}, balanceHistory[0], { accountId: '2123123', type: 'DEDUCT', amount:1, dateCreated: new Date('2018-05-20 13:40:13') }))
    if (i > 40000 && i < 50000) balanceHistory.push(Object.assign({}, balanceHistory[0], { accountId: '455', type: 'DEDUCT', amount: 1000, dateCreated: new Date('2018-07-20 13:40:13') }))
    if (i > 250000) balanceHistory.push(Object.assign({}, balanceHistory[0], { accountId: '214727', type: 'RECHARGE', amount: 300 }))
    balanceHistory.push(Object.assign({}, balanceHistory[0]))
  }

  try {
    await BalanceHistory.insertMany(balanceHistory)
  } catch(err) {
    console.log('check err', err)
  }
}

const createMessageId = () => {
  // M = MessageID, 4 = Value of Version, V = Version
  return 'M4V' +
    moment.tz('Asia/Seoul').format('YYYYMMDDHHmmss') +
    keygen._({
      length: 15,
      forceUppercase: true
    })
}

const createGroupId = () => {
  // M = MessageID, 4 = Value of Version, V = Version
  return 'G4V' +
    moment.tz('Asia/Seoul').format('YYYYMMDDHHmmss') +
    keygen._({
      length: 15,
      forceUppercase: true
    })
}

async function A() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('SETTIMEOUT')
      return resolve()
    }, 3000)
  })
}

async function funC(groupId) {
  try {
    const res = await Message.updateOne({ groupId }, { subject: "subjectB" })
    console.log(`---------- CHECK res ----------`, res)
  } catch(err) {
    console.log('check err', err)
  }
}

function getArg() {
  return new Promise((resolve, reject) => {
    /*const lastMonth = moment().subtract(1, 'month')
    const startDate = lastMonth.clone().startOf('month')
    const endDate = lastMonth.clone().endOf('month')*/

    const startDate = '2018-01-01 00:00:00'
    const endDate = '2018-12-01 00:00:00'
    BalanceHistory.collection.aggregate([
      {
        '$match': {
          dateCreated: {
            '$gte': new Date(startDate),
            '$lte': new Date(endDate)
          }
        }
      },
      {
        '$group': {
          _id: {
            accountId: '$accountId',
            type: '$type',
          },
          totalAmount: { 
            $sum: '$amount'
          }
        }
      }
    ], async (err, cursor) => {
      if (err) return reject(err)
      resolve(cursor.toArray())
    })
  })
}

async function funB() {
  try {
    await mongo.init({'host':'localhost', "database": "test2"})

    const result = await BalanceHistory.findOneAndUpdate(
      { accountId: '214727000' },
      { $inc: { beforeBalance: 100 } },
      { upsert: true, new: true }
    )
    console.log(`---------- CHECK result ----------`, result)

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
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
