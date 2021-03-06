let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message } = require('./models')

async function funA() {
  const groupId = createGroupId()
  let id = createMessageId()

  await new Group({
    "_id": groupId,
    groupId,
    "app": {"appId":null,"profit":0,"version":null},
    "sdkVersion":"JS 4.0.0",
    "osPlatform":"linux",
    "log":[],
    "status":"SENDING",
    "scheduledDate":null,
    "dateSent":"2018-08-13T02:46:55.307Z",
    "dateCompleted":null,
    "isRefunded":false,
    "accountId":"486",
    "apiVersion":"4",
    "price":{"82":{"sms":20,"lms":50,"mms":200,"ata":19,"cta":13,"dateCreated":"2018-07-31T23:13:44.945Z","dateUpdated":"2018-07-31T23:13:44.945Z"}}
  }).save()


  let messages = [
    {
      "_id": id,
      "messageId": id,
      accountId: '214727',
      groupId,
      "to": "01090683469",
      "from": "029302266",
      "text": "test",
      "type": "LMS",
      "schuledDate": "2018-09-20 13:40:13",
      "subject": "TEST",
      "kakaoOptions": {
        "senderKey": "test",
        "templateCode": "test",
        "buttonName": "test",
        "buttonUrl": "test",
        "disableSms": "true"
      },
      "statusCode": "3000"
    }
  ]

  let groups = [
    {
      "_id": groupId,
      groupId,
      apiVersion: '4',
      accountId: '214727',
      status: "SENDING"
    }
  ]

  for (let i = 0; i < 50; i++) {
    let id = createMessageId()
    // let groupId = createGroupId()

    messages.push(Object.assign({}, messages[0], { "_id": id, "messageId": id, groupId, replacement: true }))
    // groups.push(Object.assign({}, groups[0], { "_id": groupId, groupId }))
  }

  for (let i = 0; i < 20; i++) {
    let id = createMessageId()
    // let groupId = createGroupId()

    messages.push(Object.assign({}, messages[0], { "_id": id, "messageId": id, groupId}))
    // groups.push(Object.assign({}, groups[0], { "_id": groupId, groupId, isRefunded: true }))
  }

  /*
  // let groupList = await Group.find({status: 'SENDING'})
  groups.forEach((value) => {
    let id = createMessageId()
    messages.push(Object.assign({}, messages[0], { "groupId": groups[0].groupId, "_id": id, "messageId": id }))
  })
  */

  try {
    console.log('chekc groupId', groupId)
    console.log(`---------- CHECK messages ----------`, messages)
    // await Group.insertMany(groups)
    await Message.insertMany(messages)
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

async function funB() {
  try {
    await mongo.init({'host':'localhost', "database": "msgv4"})
    console.log('Start')
    await Group.remove()
    await Message.remove()
    await funA()
    console.log('Success')
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
