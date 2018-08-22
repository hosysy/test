let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message, BalanceHistory } = require('./models')

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

async function testf(skip = 0, limit = 1000, i = 0) {
  return new Promise(async (resolve, reject) => {
    Group.collection.aggregate([
      {
        $match: {
          status: 'SENDING'
        }
      },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit }
    ],
    { allowDiskUse: true },
    async (err, cursor) => {
      if (err) return reject(err)

      // 데이터를 toArray로 변환하고 다음데이터가 있는지 확인
      const hasNext = await cursor.hasNext()
      const data = await cursor.toArray()
      if (data.length < 1) {
        console.log('success!!!', skip, limit, i)
        return resolve('suc')
      }

      if (hasNext) {
        console.log(`---------- CHECK data ----------`, data.length)

        console.log('continue', skip, limit, i)
        return testf(skip += limit, limit, i += 1)
      }
      console.log('success!!', skip, limit, i)

      resolve('success')
    })
  })
}

async function saveBH() {
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 0,
      newBalance: 100,
      oldPoint: 0,
      newPoint: 0,
      balanceAmount: 100,
      pointAmount: 0,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 100,
      newBalance: 0,
      oldPoint: 0,
      newPoint: 0,
      balanceAmount: -100,
      pointAmount: 0,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 0,
      newBalance: 0,
      oldPoint: 0,
      newPoint: 100,
      balanceAmount: 0,
      pointAmount: 100,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 0,
      newBalance: 0,
      oldPoint: 100,
      newPoint: 0,
      balanceAmount: 0,
      pointAmount: -100,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 0,
      newBalance: 1000,
      oldPoint: 0,
      newPoint: 2000,
      balanceAmount: 1000,
      pointAmount: 2000,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
  await new BalanceHistory({
      accountId: '214727',
      oldBalance: 1000,
      newBalance: 2000,
      oldPoint: 1000,
      newPoint: 2000,
      balanceAmount: 1000,
      pointAmount: -1000,
      type: 'MANUAL',
      dateCreated: new Date('2018-09-20 13:40:13')
  }).save()
}

async function funB() {
  try {
    await mongo.init({'host':'localhost', "database": "msgv4"})

    // await testf()
    

    // await BalanceHistory.remove()
    // await saveBH()

    /*
    const res = await BalanceHistory.findByCondition({
      balanceDeduct: 'false',
      pointRecharge: 'false',
    })
    console.log(`---------- CHECK res ----------`, res)
    */
    const result = await BalanceHistory.updateOne(
      { accountId: '214727000' },
      { $inc: { oldBalance: 100, newBalance: 10, oldPoint: 0, newPoint: 0 }, $set: { test: 'false', wow: 'e' } }
      // { upsert: true, new: true, projection: { _id: 0 } }
    )
    console.log(`---------- CHECK result ----------`, result)

    console.log(await BalanceHistory.find({}, { _id: 0 }))

    

    /*
    await BalanceHistory.collection.aggregate([
      {
        $project: {
          '_id': 0,
          customId: '$_id',
          accountId: 1
        }
      }
    ], async (err, cursor) => {
      if (err) throw err
      const res = await cursor.next()
      console.log(`---------- CHECK res ----------`, res)
    })
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
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
