'use strict'
const mongoose = require('mongoose')
const Joi = require('joi')

/**
 * 사용자가 클라이언트에 특정 권한을 허락한 정보를 저장하는 컬렉션 Schema
 *
 * @author hosy <hosy@nurigo.net>
 */
const approvalSchema = new mongoose.Schema({
  client: {
    type: String,
    required: true,
    ref: 'Client'
  },
  scope: [{
    type: String,
    ref: 'Scope'
  }], // ex) ['user:*', 'test:*', ...]
  accountId: {
    type: Number,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  },
  toObject: { virtuals: true },
  versionKey: false,
  id: false
})

// index 설정 && unique 키로 지정
approvalSchema.index({ client: 1, accountId: 1 }, { unique: true })

/**
 * approvals가 save되기전에 하는 검사목록
 * client가 존재하는지
 * scope가 존재하는지
 * accountId가 존재하는지
 */
approvalSchema.path('client').validate(async (_id) => {
  try {
    const Client = require('./client')
    const res = await Client.count({_id})
    if (!res) throw new Error()
    return true
  } catch (err) {
    return false
  }
}, 'InvalidClientId:')
approvalSchema.path('scope').validate(async (value) => {
  try {
    const Scope = require('./scope')
    const res = await Scope.count({_id: { $in: value }})
    if (res !== value.length) throw new Error()
    return true
  } catch (err) {
    return false
  }
}, 'InvalidScope:')
approvalSchema.path('accountId').validate(async (value) => {
  try {
    const user = require('../lib/user')
    const userInfo = await user.getUserBySrl(value)
    if (userInfo.resultCode !== 'UserFound') throw new Error()
    return true
  } catch (err) {
    return false
  }
}, 'InvalidAccountId:')

/**
 * Approval 컬렉션에 있는 데이터 중 넘어온 client, accountId, scope와 동일한 데이터를 넘겨준다.
 *
 * @param {string} client
 * @param {string} accountId
 * @param {array} scope - 검색조건에 들어갈 scope 목록
 */
approvalSchema.statics.findOneByScopes = async function (client, accountId, scope) {
  try {
    const joiResult = Joi.validate({ client, accountId, scope },
      Joi.object({
        client: Joi.required(),
        accountId: Joi.required(),
        scope: Joi.array().required()
      })
    )
    if (joiResult.error) {
      throw new Error(`ValidationError:${joiResult.error.message}`)
    }

    // 넘어온 scope가 하나이상일 경우 $all()을 사용한다.
    if (scope.length > 1) scope = { $all: scope }
    const approvalInfo = await this.findOne({ client, accountId, scope })
    if (!approvalInfo) throw new Error('InvalidApproval:')

    return approvalInfo
  } catch (err) {
    throw err
  }
}

/**
 * findOne를 할 때 기본적으로 populate한 결과를 리턴한다
 * @params {function} next - CallbackFunction 다음 미들웨어 호출
 */
approvalSchema.pre('findOne', function (next) {
  this.populate({
    path: 'client',
    select: '-__v -clientSecret'
  }).populate({
    path: 'scope'
  })
  next()
})

/**
 * find를 할 때 기본적으로 populate한 결과를 리턴한다
 * @params {function} next - CallbackFunction 다음 미들웨어 호출
 */
approvalSchema.pre('find', function (next) {
  this.populate({
    path: 'client',
    select: '-__v -clientSecret'
  }).populate({
    path: 'scope'
  })
  next()
})

/**
 * query에 들어있는 데이터를 가공하여 검색합니다.
 * @param {object} query - 데이터가 들어있는 변수
 */
approvalSchema.statics.findRange = function (query) {
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
  return this.find(query).select('-_id').skip(offset).limit(limit)
}

module.exports = mongoose.model('Approval', approvalSchema)
