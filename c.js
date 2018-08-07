let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message } = require('./models')

async function funA() {
  const groupId = createGroupId()
  let id = createMessageId()
  let messages = [
    {
      "_id": id,
      "messageId": id,
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
      "statusCode": "4000"
    }
  ]

  /*
  for (let i = 0; i < 10000; i++) {
    let id = createMessageId()
    let gid = createGroupId()

    messages.push(Object.assign({}, messages[0], { "groupid": gid, "_id": id, "messageId": id }))
  }*/

  let groups = [
    {
      "_id": groupId,
      groupId,
      "schuledDate": "2018-08-20 13:40:13",
      "status": "SENDING",
      apiVersion: '4',
      accountId: '214727'
    }
  ]

  for (let i = 0; i < 10000; i++) {
    let id = createMessageId()
    let groupId = createGroupId()

    messages.push(Object.assign({}, messages[0], { "_id": id, "messageId": id, groupId }))
    groups.push(Object.assign({}, groups[0], { "_id": groupId, groupId }))
  }

  /*
  // let groupList = await Group.find({status: 'SENDING'})
  groups.forEach((value) => {
    let id = createMessageId()
    messages.push(Object.assign({}, messages[0], { "groupId": groups[0].groupId, "_id": id, "messageId": id }))
  })
  */

  try {
    await Group.insertMany(groups)
    await Message.collection.insertMany(messages)
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
    await funA()
    console.log('Success')
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
