'use strict'

const mongoose = require('mongoose')
const { Client, Group } = require('./models')
const moment = require('moment-timezone')
const keygen = require('keygenerator')

function getId() {
  let apiVersion = '4', status = 'PENDING'
  const uniqKey = keygen._({ length: 15, forceUppercase: true })
  const groupId = `G${apiVersion}V${moment.tz('Asia/Seoul').format('YYYYMMDDHHmmss')}${uniqKey}`
  return groupId
}

async function start() {
  try {
    await mongoose.connect('mongodb://localhost/pm2test')

    /*let clients= [ { "status": "PENDDING", "count": 0, } ]
    for (let i = 0; i < 100000; i++) { clients.push(Object.assign({}, clients[0])) }
    await Client.collection.insertMany(clients)*/

    const types = ['sms', 'lms', 'mms', 'ata', 'cta']
    const groups = []
    for (let i = 0; i < 100000; i++) {
      const groupId = getId()
      groups.push({
        _id: groupId,
        groupId,
        accountId: '12925149',
        scheduledDate: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss') ,
        status: 'SCHEDULED',
        count: Object.assign(...types.map(type => ({ [type]: 0 }))),
      })
    }
    await Group.collection.insertMany(groups)

    mongoose.connection.close()
  } catch (err) {
    console.log('err', err)
  }
}

start()
