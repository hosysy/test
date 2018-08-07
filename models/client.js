'use strict'

// mongoose schema 의 methods / statics 을 사용할때에는 arrow function 을 사용하면 안됨.
const keygen = require('keygenerator')
const mongoose = require('mongoose')
const { accountIdValidator, clientIdValidator, clientSecretValidator } = require('./validators')

const ClientSchema = new mongoose.Schema({
  _id: String,
  accountId: {
    type: Number,
    required: [true, 'accountId 는 필수 항목입니다.'],
    validate: {
      isAsync: true,
      validator: accountIdValidator,
      message: 'accountId 에 대한 값이 잘못 되었습니다.'
    }
  },
  name: {
    type: String,
    required: [true, 'name 은 필수 항목입니다.'],
    maxlength: 50,
    minlength: 3
  },
  clientId: {
    type: String,
    // 현재 db 에 중복된 값이 존재해서 일단 커멘트 처리함
    // unique: true,
    required: [true, 'clientId 는 필수 항목입니다.'],
    validate: {
      isAsync: true,
      validator: clientIdValidator,
      message: 'accountId 에 대한 값이 잘못 되었습니다.'
    }
  },
  clientSecret: {
    type: String,
    // 현재 db 에 중복된 값이 존재해서 일단 커멘트 처리함
    // unique: true,
    required: [true, 'clientSecret 은 필수 항목입니다.'],
    validate: {
      isAsync: true,
      validator: clientSecretValidator,
      message: 'accountId 에 대한 값이 잘못 되었습니다.'
    }
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    required: true,
    match: /^(INACTIVE|ACTIVE)$/
  },
  approvedUserCount: {
    type: Number,
    default: 0
  },
  allowedGrants: [{
    type: String,
    match: /^(authorization_code|password|client_credentials|refresh_token)$/
  }],
  description: {
    type: String,
    maxlength: 256,
    default: ''
  },
  redirectUri: {
    type: String,
    required: true,
    // match: /^(https|http)?:\/\/(\w*:\w*@)?[-\w.]+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/
    match: /^(https|http)?:\/\//
  },
  imageUri: {
    type: String,
    required: true,
    // match: /^(https|http)?:\/\/(\w*:\w*@)?[-\w.]+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/
    match: /^(https|http)?:\/\//,
    default: 'http://enter.default.image.url.here'
  },
  dateCreated: {
    type: Date,
    default: new Date()
  }
}, {
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
}, { timestamps: true })

/**
 * Client Schema save 의 'pre' middleware
 * 모든 document 의 저장 전에 호출
 */
ClientSchema.pre('save', function (next) {
  this._id = this.clientId
  next()
})

/**
 * client secret 을 재생성합니다
 *
 * @param {string} _id - client id
 * @param {function} callback - client secret 을 재생성 후에 호출될 함수
 */
ClientSchema.statics.refreshClientSecret = function (_id, callback) {
  this.findOne({ _id }, (err, client) => {
    if (err || !client) return callback(err)

    client.clientSecret = client.createClientSecret()
    if (typeof callback === 'function') return client.save(callback)
    else return client.save()
  })
}

/**
 * 임의의 client secret 을 생성합니다
 */
ClientSchema.methods.createClientSecret = function () {
  return keygen._({ forceUppercase: true, length: 32 })
}

/**
 * 임의의 client id 를 생성합니다
 */
ClientSchema.methods.createClientId = function () {
  return 'CID' + keygen._({ forceUppercase: true, length: 13 })
}

/**
 * 새로운 client 를 생성합니다
 * @param {array<string>} allowedGrants - default 'authorization_code'
 */
ClientSchema.methods.createNew = function (allowedGrants) {
  this.clientId = this.createClientId()
  this.clientSecret = this.createClientSecret()
  this.status = 'ACTIVE'
  this.allowedGrants = allowedGrants == null ? [ 'authorization_code' ] : allowedGrants
  return this.save()
}

/**
 * client 의 상태를 변경합니다.
 * @param {string} status - 'ACTIVE' 또는 'INACTIVE' 값이 올수 있습니다.
 */
ClientSchema.methods.changeStatus = function (status) {
  this.status = status
  return this.save()
}

/**
 * express 에서 client 에 대한 값을 리턴해야되는 경우 사용됩니다
 */
ClientSchema.methods.getReturn = function () {
  return {
    name: this.name,
    description: this.description,
    accountId: this.accountId,
    clientId: this.clientId,
    clientSecret: this.clientSecret,
    status: this.status,
    allowedGrants: this.allowedGrants,
    approvedUserCount: this.approvedUserCount,
    redirectUri: this.redirectUri,
    imageUri: this.imageUri,
    dateCreated: this.dateCreated,
    dateUpdated: this.dateUpdated
  }
}
/**
 * 클라이언트의 민감한 정보를 제외한 모든 정보를 return 합니다.
 */
ClientSchema.methods.getClient = function () {
  return {
    name: this.name,
    description: this.description,
    accountId: this.accountId,
    clientId: this.clientId,
    // clientSecret: this.clientSecret,
    status: this.status,
    allowedGrants: this.allowedGrants,
    approvedUserCount: this.approvedUserCount,
    redirectUri: this.redirectUri,
    imageUri: this.imageUri,
    dateCreated: this.dateCreated,
    dateUpdated: this.dateUpdated
  }
}

/**
 * query에 들어있는 데이터를 가공하여 검색합니다.
 * @param {object} query - 데이터가 들어있는 변수
 */
ClientSchema.statics.findRange = function (query) {
  // 날짜 처리
  query.dateCreated = {}
  if (query.client_id) {
    query.clientId = query.client_id
    delete query.client_id
  }
  if (query.startDay) {
    query.dateCreated.$gte = new Date(query.startDay)
    delete query.startDay
  }
  if (query.endDay) {
    query.dateCreated.$lte = new Date(query.endDay)
    delete query.endDay
  }
  if (query.dateCreated.$gte && query.dateCreated.$lte && (query.dateCreated.$gte > query.dateCreated.$lte)) {
    throw new Error('ValidationError:시작날짜는 종료날짜보다 작아야 합니다')
  }
  if (!query.dateCreated.$gte || !query.dateCreated.$lte) delete query.dateCreated

  // 범위 처리
  const offset = query.offset ? Number(query.offset) : 0
  const limit = query.limit ? Number(query.limit) : 20
  delete query.offset
  delete query.limit
  return this.find(query).select('-_id -__v').skip(offset).limit(limit)
}

/**
 * 해당 clientId 의 상태가 'ACTIVE' 인지 검사합니다
 * @param {string} _id - client id
 */
ClientSchema.statics.isClientActive = async function (_id) {
  try {
    const client = await this.findOne({ _id })
    if (!client) throw new Error('InvalidClientId:')
    if (client.status !== 'ACTIVE') throw new Error('InactiveClient:')
    return client
  } catch (err) {
    throw err
  }
}

ClientSchema.statics.increaseUserCount = function (_id) {
  return this.update({ _id }, { $inc: { approvedUserCount: 1 } })
}

ClientSchema.statics.decreaseUserCount = function (_id) {
  return this.update({ _id }, { $inc: { approvedUserCount: -1 } })
}

module.exports = mongoose.model('Client', ClientSchema)
