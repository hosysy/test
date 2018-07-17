let _ = require('lodash')
let Joi = require('joi')

/*
let messages = [
  {
    "to": "01090683469",
    "from": "029302266",
    "text": "test",
    "type": "SMS",
    "subject": "TEST",
    "kakaoOptions": {
      "senderKey": "test",
      "templateCode": "test",
      "buttonName": "test",
      "buttonUrl": "test",
      "disableSms": "true"
    }
  }
]

for (let i = 0; i < 10000; i++) {
  messages.push(Object.assign({}, messages[0]))
}

console.log("MESSAGE LENGTH", messages.length)

console.time('joi yo')
let joiSchema = Joi.array().items(Joi.object({
  to: Joi.required(),
  from: Joi.string().trim().required(),
  text: Joi.string().trim().required(),
  type: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  subject: Joi.string().trim().optional()
    .when('type', {
      is: ['SMS', 'ATA', 'CTA'],
      then: Joi.valid()
    }),
  imageId: Joi.string().trim().optional(),
  kakaoOptions: Joi.object({
    senderKey: Joi.string().trim().required(),
    templateCode: Joi.string().trim().optional(),
    buttonName: Joi.string().trim().optional(),
    buttonUrl: Joi.string().trim().optional(),
    disableSms: Joi.boolean().optional()
  }).optional(),
  customFields: Joi.object().optional()
}).required())
let a = null
const joiResult = Joi.validate(messages, joiSchema, { abortEarly: false })

// console.log('check messages')
// console.log(messages)

console.timeEnd('joi yo')
if (joiResult.error) console.log(joiResult.error.details.length)

console.log('------------------------------------------------------------------------------------------')

console.time('CHECK AJV')

var Ajv = require('ajv')
var ajv = new Ajv({
  allErrors:true,
  jsonPointers: true,
  coerceTypes: true
}) // options can be passed, e.g. {allErrors: true}a
/*ajv.addKeyword('type', {
  validate: (schema, data, t, r, q) => {
    // console.log(schema, data, t, r, q)
    return typeof schema === 'string' && data !== ''
  },
  errors: true,
  errorMessage: {
    type: 'should be an object', // will not replace internal "type" error for the property "foo"
    required: 'should have property foo',
    additionalProperties: 'should not have properties other than foo'
  }
})*/

/*
const err1 = [{keyword: 'subject', message: `'LMS', 'MMS'에서만 사용할 수 있습니다.`, params: {keyword: 'subject'}}]

ajv.addKeyword('checkSubject', {
  schema: false,
  validate: (value, dataPath, object, key) => {
    if ([ 'LMS', 'MMS' ].indexOf(object.type) < 0) return false
    return true
  },
  errorMessage: { keyword: 'a', message: 't', params: 'b' }
})

ajv.addKeyword('checkString', {
  schema: false,
  validate: (value, dataPath, object, key) => {
    if (Object.prototype.toString.call(value) !== '[object String]') return false
    if (_.trim(value).length < 1) return false
    return true
  }
})

ajv.addKeyword('checkKakao', {
  schema: false,
  validate: (value, dataPath, object, key) => {
    if ([ 'ATA', 'CTA' ].indexOf(object.type) < 0) return false
    return true
  }
})

ajv.addKeyword('checkAlimtalk', {
  schema: false,
  validate: (value, dataPath, object, key, parentObj) => {
    if ('ATA' !== parentObj.type) return false
    return true
  }
})

ajv.addKeyword('checkMms', {
  schema: false,
  validate: (value, dataPath, object, key) => {
    if ('MMS' !== object.type) return false
    return true
  }
})

console.time('CHECK AJV INDI')
var ajv2 = new Ajv({ ownProperties: true, allErrors: true }) // options can be passed, e.g. {allErrors: true}a
var schema2 = {
  "type": "object",
  "properties": {
    "to": { 
      "allOf": [
        { "checkString": true },
        { "pattern": '^[0-9]+$' }
      ]
    },
    "from": { 
      "allOf": [
        { "checkString": true },
        { "pattern": '^[0-9]{8,11}$' }
      ]
    },
    "text": { "checkString": true },
    "type": { "checkString": true },
    "country": { "checkString": true },
    "subject": { 
      "allOf": [
        { "checkString": true },
        { "checkSubject": true }
      ]
    },
    "imageId": {
      "allOf": [
        { "checkString": true },
        { "checkMms": true }
      ]
    },
    "kakaoOptions": {
      "allOf": [
        { "checkKakao": true },
        {
          "type": "object",
          "properties": {
            "senderKey": { "checkString": true },
            "templateCode": {
              "allOf": [
                { "type": "boolean" },
                { "checkAlimtalk": true }
              ]
            },
            "buttonName": {
              "allOf": [
                { "checkString": true },
                { "checkAlimtalk": true }
              ]
            },
            "buttonUrl": {
              "allOf": [
                { "checkString": true },
                { "checkAlimtalk": true }
              ]
            },
            "disableSms": { "checkString": true }
          },
          "required": [ "senderKey", "templateCode" ]
        }
      ]
    },
    "customFields": { "type": "object" },
  },
  "required": [ "to", "from", "text" ]
}
let message = messages[0]
// message.type = 'LMS'
delete message.kakaoOptions
message.subject
console.log(message)

let i = 0
for (i = 0; i < 10000; i++) {
  var valid = ajv.validate(schema2, message)
}

const convertErrorObj = (message, statusCode, errorMessage = null) => {
  const obj = {}
  if (errorMessage) obj.statusMessage = errorMessage
  return Object.assign(obj, message, { statusCode, groupId: 'groupId' })
}

console.log(i)
if (!valid) {
  console.log('ERRORajv.errors.length')
  console.log(ajv.errors.length)
  console.log(ajv.errors)
  let test
  switch (ajv.errors[0].keyword) {
    case 'checkAlimtalk':
      test = convertErrorObj(message, '1011', `'templateCode', 'buttonName', 'buttonurl'은 'ATA'에서만 사용 가능합니다.`)
      break
    case 'checkKakao':
      test = convertErrorObj(message, '1011', `'kakaoOptions'는 'ATA', 'CTA'에서만 사용 가능합니다.`)
      break
    case 'checkSubject':
      test = convertErrorObj(message, '1011', `'subject'는 'LMS', 'MMS'에서만 사용 가능합니다.`)
      break
    case 'checkMms':
      test = convertErrorObj(message, '1011', `'imageId'는 'MMS'에서만 사용 가능합니다.`)
      break
    case 'checkString':
    case 'type':
      test = convertErrorObj(message, '1011', `'${ajv.errors[0].dataPath.substr(1)}' ${ajv.errors[0].message}`)
      break
    case 'required':
      test = convertErrorObj(message, '1010', `'${ajv.errors[0].dataPath.substr(1)}' ${ajv.errors[0].message}`)
      break
    case 'pattern':
      test = convertErrorObj(message, '1011', `'${ajv.errors[0].dataPath.substr(1)}'의 전화번호 형식이 잘못되었습니다.`)
      break
    default:
      test = convertErrorObj(message, '1024', ajv.errors[0].message)
  }
  
  console.log(test)
}
console.timeEnd('CHECK AJV INDI')
*/

a = []
for (let i = 0; i < 1000000; i++) {
  a.push(i)
}
console.log('test a.count', a.length)

console.time('use for -- 1')
let c = []
for (const val of a) {
  // c.push(val + a)
  c[0] = val
}
console.log(c.length)
console.timeEnd('use for -- 1')

console.time('use map -- 2')
let d = a.map((v, i) => v)
console.log(d.length)
console.timeEnd('use map -- 2')

console.time('use reduce -- 3')
let e = 0
a.reduce((a, b) => e = b)
console.log(e)
console.timeEnd('use reduce -- 3')

console.time('use foreach -- 4')
let f = 0
a.forEach((value) => f = value)
console.log(f)
console.timeEnd('use foreach -- 4')



/*
let data1 = []
let data2 = []

for (let i = 0; i < 100000; i++) {
  data2.push({
    to: 'b' + i,
    from: 'b' + i + 'b'
  })
  data2.push({
    to: 'c' + i,
    from: 'c' + i + 'c'
  })
}

console.log(data1.length)
console.log(data2.length)

console.time('check flatten')
let checkA = _.flatten(data2)
console.log('checkA : ' + checkA.length)
console.timeEnd('check flatten')

console.time('check concat')
let checkB = [].concat(data2)
console.log('checkB : ' + checkB.length)
console.timeEnd('check concat')


let message = { a: 1 }
const joiResult = Joi.validate(message,
Joi.object({
  a: Joi.required(),
  customFields: Joi.object().required()
}).required()
)
if (joiResult.error) {
  console.log('ERrror')
  console.log(joiResult.error.message)
}
*/

/*
let redis = require('redis')

let redisClient = null

redisClient = redis.createClient()
redisClient.on('connect', async () => {
  try {
    let a = await redisClient.hgetall('test')
    console.log('CHECK A', a)
    console.log('CHECK B', a.delflag)
    if (a.delflag === 'N' && a.state === '3') console.log('NO')
  } catch (err) {
    console.log('ERROR!@##@#@#!', err)
  }
  console.log('CONNECTED!!!!!!!!!!!!!')
  redisClient.quit()
})


const funA = async () => {
  console.log('check in')
  const mongo = require('@nurigo/mongo')
  const { Message, Group } = require('@nurigo/mongo/models')
  try {
    await mongo.init({'host':'localhost', "database": "test"})
  } catch (err) {
    console.error(err)
  }

  try {
    let test = await Message.find({accountId:'124727'}).count()
    console.log('checkA')
    console.log(test)
    let testb = await Message.find({accountId:'124727'}).skip(0).limit(1)
    console.log(testb)
  } catch (err) {
    console.error(err)
  }
}

funA()
*/

/*
var schema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": { 
      "to": { "checkString": true },
      "from": { "type": "number"},
      "text": { "checkString": true },
      "type": { "checkString": true },
      "country": { "checkString": true },
      "subject": { 
        "allOf": [
          { "checkString": true },
          { "checkSubject": true }
        ]
      },
      "imageId": { "checkString": true },
      "kakaoOptions": {
        "allOf": [
          { "checkKakao": true },
          {
            "type": "object",
            "properties": {
              "senderKey": { "checkString": true },
              "templateCode": { "checkString": true },
              "buttonName": { "checkString": true },
              "buttonUrl": { "checkString": true },
              "disableSms": { "checkString": true }
            }
          }
        ]
      },
      "customFields": { "type": "object" }
    }
  }
}

let validate = ajv.compile(schema)
var valid = validate(messages)
console.timeEnd('CHECK AJV')
if (!valid) {
  console.log('ERRORajv.errors.length')
  console.log(validate.errors.length)

  let errorData = {}
  _.flatMap(validate.errors, obj => {
    return 'test'
  })
  console.log('oeobj')
  console.log(validate.errors[0])
  console.log(validate.errors[0].dataPath.match(/^\/.*$\/$/))
  // console.log(validate.errors[0])
  // console.log(validate.errors[1])
  // console.log(valid)
}*/
/*
const funA = async () => {
  console.log('check in')
  const mongo = require('@nurigo/mongo')
  const { Message, Group } = require('@nurigo/mongo/models')
  try {
    await mongo.init({'host':'localhost', "database": "test"})
  } catch (err) {
    console.error(err)
  }

  let arrayTest = []
  for (let i = 0; i< 100000; i++) {
    arrayTest.push(i)
  }
  console.log('array length', arrayTest.length)
  try {
    let a = await arrayTest.map(async (val) => {
      let test = await Message.find({accountId:'124727'})
      return false
    })
    console.log('checkA')
    console.log(a)
    console.log('end')
    mongo.mongoose.connection.close()
  } catch (err) {
    console.error(err)
  }
}

funA()
*/

let t = {}
for(let i =0; i < 10000; i ++) {
  t[i] = true
}

console.time('test');
let resultA
for (let i in t) {
  resultA = i
}
console.log(resultA)
console.timeEnd('test') 

console.time('test');
let resultB
Object.keys(t).forEach((i) => {
  resultB = i
})
console.log(resultA)
console.timeEnd('test') 
/*

// user_id 가 없으면 member_srl로 user_id를 가져옴
    if (!util.keyCheck(data, 'user_id')) {
      try {
        const payload = { value: data.member_srl, is_admin: 'N' }
        const res = await user.getUserBySrl(payload)
        if (res.resultCode !== 'UserFound') return reject('member_srl이 잘못되었습니다.')
        data.user_id = res.data.user_id
      } catch (err) {
        throw err
      }
    }
*/


let op = {
  message: '[ { type: "a" } ]'
}
console.log(JSON.stringify(op))

let cc = "{\"message\": \"[ { type: \"a\" } ]\"}"
console.log(JSON.parse(cc))

