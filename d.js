const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Group, Message } = require('@nurigo/mongo/models')

function setData(res) {
  return res.next()
}


async function funB() {
  try {
    let count = Array(500)
    await mongo.init({'host':'localhost', "database": "test"})

    console.log('check Start')
    let res = await Group.collection.find({'schuledDate': {$gt: '2017-01-01 00:00:00'}})
    let queues = []
    let listData = []
    
    console.time('test-1')
    while (await res.hasNext() === true) {
      listData.push(await res.next())
      // queues.push(setData(res))
    }
    console.timeEnd('test-1')
    // console.log('queues.length', queues.length)
    console.log('listData.length', listData.length)

    /*
    console.time('test-2')
    await Promise.all(queues).then((res) => {
      console.timeEnd('test-1')
      console.log('res.length', res.length)
      console.log('messages[0]', res[0])
      console.log('messages[1]', res[1])
      console.timeEnd('test-2')
      mongo.mongoose.connection.close()
      // console.log('messages[19999]', messages[19999])
    }).catch((err) => {
      console.log('check err', err)
    })
    */

    /*Group.collection.find().toArray((err, data) => {
      console.log('check err', err)
      console.log('check data', data)
      mongo.mongoose.connection.close()
    })*/

  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

funB()
