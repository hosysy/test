let _ = require('lodash')
let Joi = require('joi')
const moment = require('moment-timezone')
const mongo = require('@nurigo/mongo')
const keygen = require('keygenerator')
const { Company } = require('./models')

async function funA() {
  await Company.remove()
  const data = [
    {
      accountId: '214727',
      name: '애플',
      owner: '톰 크루즈',
      address: '미국',
      businessNumber: '2178133791',     // 사업자 정보
      businessType: '서비스',       // 업태
      businessItems: '소프트웨어',      // 종목
      contacts: [
        {
          name: '담당자1',
          email: 't1@t.t',
          phone: '01020118099'
        },
        {
          name: '담당자2',
          email: 't2@t.t',
          phone: '01020118099'
        }
      ]
    },
    {
      accountId: '485',
      name: '구글',
      owner: '잭',
      address: '유럽',
      businessNumber: '2178133791',     // 사업자 정보
      businessType: '서비스',       // 업태
      businessItems: '소프트웨어',      // 종목
      contacts: [
        {
          name: '담당자1',
          email: 't1@t.t',
          phone: '01020118099'
        }
      ]
    }
  ]

  for (let o = 0; o < 5000; o++) {
    const accountId = `1${o}`
    if (o === 499) console.log('accountId', accountId)
    let obj = Object.assign({}, data[0], { accountId, name: accountId })
    data.push(obj)
  }
  try {
    console.log('data.length : ', data.length)
    await Company.insertMany(data)
  } catch(err) {
    console.log('check err', err)
  }
}

async function test() {
  try {
    await mongo.init({'host':'localhost', "database": "temp3"})

    await funA()

    console.log('check items count')
    console.log(await Company.count())

    console.log('Success')
    mongo.mongoose.connection.close()
  } catch (ERR) {
    console.log('check ERR', ERR)
    mongo.mongoose.connection.close()
  }
}

test()
