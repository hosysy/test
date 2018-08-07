/* eslint-disable no-return-await */
/**
 * API V4 에 대한 몽구스 스키마 (그룹)
 *
 * @author Henry Kim <henry@nurigo.net>
 */
'use strict'

const mongoose = require('mongoose')
const moment = require('moment-timezone')
const keygen = require('keygenerator')
const Message = require('./message')

const types = [
  'total', // 전체
  'sentTotal', // 총 전송 카운트
  'sentFailed', // 전송 실패
  'sentSuccess', // 전송 성공
  'sentPending', // 전송 중
  'sentReplacement', // 대체 발송 카운트

  'refund', // 환급 카운트

  'registeredFailed', // 접수 실패
  'registeredSuccess' // 접수 성공
]

const groupSchema = new mongoose.Schema({
  _id: { type: String, uppercase: true, trim: true },
  groupId: { type: String, required: true, uppercase: true, trim: true },
  accountId: { type: String, required: true },
  apiVersion: { type: String, required: true },
  sdkVersion: { type: String, default: null },
  osPlatform: { type: String, default: null },
  count: Object.assign(...types.map(type => ({ [type]: { type: Number, min: 0, default: 0 } }))),
  // 차감할 타입/국가별 문자 카운트
  countForCharge: {
    sms: { type: Object, default: {} },
    lms: { type: Object, default: {} },
    mms: { type: Object, default: {} },
    ata: { type: Object, default: {} },
    cta: { type: Object, default: {} }
  },
  log: { type: Array, default: [] },
  status: { type: String, default: 'PENDING' },
  scheduledDate: { type: Date, default: null },
  dateSent: { type: Date, default: null }, // 발송 요청 시간
  dateCompleted: { type: Date, default: null }, // 그룹 발송이 완료된 시간
  balance: {
    requested: { type: Number, default: 0 }, // 발송시 차감 금액
    replacement: { type: Number, default: 0 }, // 대체발송 차감 금액
    refund: { type: Number, default: 0 }, // 환급으로 인해 충전된 금액
    sum: { type: Number, default: 0 } // 실제로 차감된 금액
  },
  point: {
    requested: { type: Number, default: 0 }, // 발송시 차감 포인트
    replacement: { type: Number, default: 0 }, // 대체발송시 차감 포인트
    refund: { type: Number, default: 0 }, // 환급으로 인해 충전된 포인트
    sum: { type: Number, default: 0 } // 실제로 차감된 포인트
  },
  isRefunded: {type: Boolean, default: false}, // 환급여부, true면 환급완료
  app: {
    appId: { type: String, default: null },
    profit: { type: Number, default: 0 },
    version: { type: String, default: null }
  },
  // 그룹에 사용된 국가별 가격 { 82: { sms: 10, lms: 20, mms: 200, ata: 50 } }
  price: { type: Object, default: {} }
}, {
  id: false,
  versionKey: false,
  minimize: false,
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
})

groupSchema.index({
  'accountId': 1,
  'status': 1,
  'dateCreated': 1,
  'dateUpdated': 1,
  'scheduledDate': 1,
  'count.total': 1,
  'count.sentTotal': 1
})
groupSchema.index({ 'dateSent': 1, 'dateCompleted': 1 })

// save 이전 실행할 작업
groupSchema.pre('save', function (next) {
  this._id = this.groupId
  next()
})

/**
 * 메시지 그룹 생성
 * @param {Object} [groupInfo={}] - 그룹 생성시 필요한 값
 * @param {*} [log] - 메시지 그룹 생성 시 남길 로그
 */
groupSchema.statics.createNew = function (groupInfo = {}, log) {
  const createAt = new Date()
  const uniqKey = keygen._({ length: 15, forceUppercase: true })
  let {
    apiVersion = '4',
    groupId = `G${apiVersion}V${moment().tz('Asia/Seoul').format('YYYYMMDDHHmmss')}${uniqKey}`,
    status = 'PENDING'
  } = groupInfo

  log = log ? [log] : [{ message: '메시지 그룹이 생성되었습니다.', createAt }]
  return this.create({ ...groupInfo, groupId, status, log, apiVersion })
}

/**
 * 메시지 그룹 정보
 * @param {string} _id - 조회할 그룹 아이디
 * @param {string} accountId - 메시지 그룹 소유자 account id
 */
groupSchema.statics.getMessageGroupInfo = function (_id, accountId) {
  return this.findOne({ _id, accountId })
}

/**
 * 메시지 그룹 목록
 * @param {Object} searchParams={} - 검색에 필요한 파라미터
 */
groupSchema.statics.getMessageGroupList = async function ({
  searchParams = {
    criteria: [],
    value: [],
    cond: []
  },
  offset = 0,
  limit = 20,
  operator = '$and',
  sort = 'dateUpdated',
  orderBy = -1
}) {
  let query = {}
  offset = Number(offset) || 0
  limit = Number(limit) || 20
  const response = {
    offset,
    limit,
    groupList: {}
  }
  const { criteria, value, cond } = searchParams
  if (criteria.length && value.length && cond.length) {
    const condition = criteria.map((field, index) => {
      // 그룹아이디
      field = field === 'groupId' ? '_id' : field
      // 날짜 검색
      value[index] = ['dateCreated', 'dateUpdated', 'scheduledDate'].indexOf(field) !== -1 ? new Date(value[index]) : value[index]
      return { [field]: { ['$' + cond[index]]: value[index] } }
    })
    query = { [operator]: condition }
  }
  const timezone = 'Asia/Seoul'
  const cursor = this.collection.aggregate([
    { $match: query },
    { $skip: offset },
    { $limit: limit },
    { $sort: { [sort]: orderBy } },
    {
      $addFields: {
        dateCreated: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S',
            date: '$dateCreated',
            timezone
          }
        },
        dateUpdated: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S',
            date: '$dateCreated',
            timezone
          }
        }
      }
    }
  ])
  response.hasNext = await cursor.hasNext() ? 1 : 0
  const groupList = await cursor.toArray()
  if (!groupList.length) return response
  if (groupList.length < limit) response.hasNext = 0
  Object.assign(response.groupList, ...groupList.map(data => ({ [data.groupId]: data })))
  return response
}

/**
 * 그룹 조회 status조건
 * @param {string} status - 그룹 상태
 */
groupSchema.query.byStatus = function (status) {
  return this.find({ status })
}

/**
 * startDate 와 endDate 를 통해 createdDate 를 조회합니다.
 * @param {string | number} startDate - new Date 로 변환될 string
 * @param {string | number} endDate - new Date 로 변환될 string
 */
groupSchema.query.byDateCreated = function (startDate, endDate) {
  startDate = startDate || 0
  endDate = endDate || moment().tz('Asia/Seoul')
  return this.find({ dateCreated: { $gte: new Date(startDate), $lte: new Date(endDate) } })
}

/**
 * 메시지 그룹 삭제
 * @param {string} _id - 삭제 그룹 아이디
 * @param {string} accountId - 메시지 그룹 소유자 account id
 * @param {*} message - 메시지 그룹 삭제 시 남길 로그 메시지
 */
groupSchema.statics.deleteMessageGroup = async function (_id, accountId, message) {
  const createAt = new Date()
  message = message || '메시지 그룹이 삭제되었습니다.'
  const log = { message, createAt }
  const status = { status: 'DELETED' }
  const set = { $set: status, $push: { log } }
  const messageGroupData = await this.findOne({ _id })
  if (!messageGroupData) throw new Error('ResourceNotFound')
  // accountId에 맞는 그룹인지 확인
  if (messageGroupData.accountId !== accountId) throw new Error('Forbidden:해당계정의 그룹만 삭제 가능합니다.')
  // 상태 검사
  if (messageGroupData.status !== 'PENDING') throw new Error(`NotOperationalStatus:PENDING 상태의 그룹만 삭제할 수 있습니다. 현재 상태는 ${messageGroupData.status} 입니다.`)
  // 상태 업데이트
  const { nModified } = await this.updateOne({ _id, accountId }, set)
  if (!nModified) throw new Error('InternalError')
  messageGroupData.log.push(log)
  return Object.assign(messageGroupData.toObject(), status)
}

/**
 * groupId 로 find 합니다.
 *
 * @param {string} _id - 그룹 아이디
 */
groupSchema.statics.findOneByGroupId = function (_id) {
  _id = _id.toUpperCase()
  return this.findOne({ _id })
}

/**
 * accountId 로 find 합니다.
 *
 * @param {string} accountId - 메시지 아이디
 */
groupSchema.statics.findByAccountId = function (accountId) {
  return this.find({ accountId })
}

/**
 * 해당 그룹에 속한 메시지들을 불러옵니다.
 */
groupSchema.methods.getMessageList = async function () {
  return new Promise((resolve, reject) => {
    Message.find({ groupId: this.groupId }).select({ _id: false }).lean().exec((err, msgs) => {
      if (err) return reject(err)
      resolve(msgs)
    })
  })
}

/**
 * @author Genie
 * @param groupId - 업데이트 or 로그를 넣을 groupID
 * @param log - 로그
 * @param set - 업데이트
 * @return {Promise<*>}
 */
groupSchema.statics.updateFieldAndPushLog = async function (groupId, log, set) {
  return await this.findOneAndUpdate({ _id: groupId }, { $push: log, $set: set }).exec()
}

/**
 * groupSchema.find().paginate(offset, limit)
 *
 * @param {number | string} offset - 몇 번째부터 가져올지
 * @param {number | string} limit - 몇개를 가져올지
 */
groupSchema.query.paginate = function (offset, limit) {
  return this.skip(parseInt(offset)).limit(parseInt(limit))
}

/**
 * 그룹의 상태값을 검사합니다.
 * 사용되는 곳
 * 1. 그룹 발송
 * 2. 메시지그룹 예약
 */
groupSchema.methods.checkValid = function (tempInvalidStatusList) {
  const invalidStatusList = tempInvalidStatusList || [
    ['SENDING', 'GroupInProcessing:이미 발송 요청된 그룹입니다.'],
    ['DELETED', 'DeletedGroup:삭제 처리된 그룹으로는 발송이 안됩니다.'],
    ['FAILED', 'FailedGroup:그룹 생성에 실패했던 그룹입니다.\n그룹 로그를 확인해주세요.'],
    ['SCHEDULED', 'ScheduledGroup:발송 예약 중인 그룹이므로 발송에 실패하였습니다. 예약 취소 후 발송 가능합니다.'],
    ['COMPLETE', 'AlreadySent:이미 발송이 완료된 그룹 입니다.']
  ]
  // 그룹의 상태가 대기중이 아니면 발송되지 않도록
  invalidStatusList.forEach(value => {
    if (this.status === value[0]) throw new Error(value[1])
  })
  if (this.status !== 'PENDING') throw new Error(`InvalidStatus:'PENDING' 상태의 그룹만 전송 가능합니다.`)
  if (this.count.registeredSuccess <= 0) throw new Error('MessagesNotFound:해당 그룹에 메시지가 존재하지 않습니다.')
}

module.exports = mongoose.model('Group', groupSchema)
