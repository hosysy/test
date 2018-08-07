/**
 * API V4 에 대한 몽구스 스키마 (메시지)
 *
 * @author Henry Kim <henry@nurigo.net>
 */
'use strict'

const mongoose = require('mongoose')
const moment = require('moment-timezone')
const _ = require('lodash')
const messageStatusCodes = require('@nurigo/message-status-codes')

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    minlength: 32,
    maxlength: 32,
    uppercase: true
  },
  messageId: {
    type: String,
    required: [true, '필수 입력 요소 입니다.'],
    minlength: 32,
    maxlength: 32,
    uppercase: true
  },
  groupId: {
    type: String,
    required: [true, '필수 입력 요소 입니다.'],
    minlength: 32,
    maxlength: 32,
    uppercase: true
  },
  accountId: { type: String, required: true },
  to: {
    type: String,
    required: [true, '필수 입력 요소 입니다.']
  },
  from: {
    type: String,
    required: [true, '필수 입력 요소 입니다.']
  },
  text: {
    type: String,
    required: [true, '필수 입력 요소 입니다.']
  },
  type: {type: String, default: 'AUTO', uppercase: true},
  customFields: {type: Object, default: null},
  country: {type: String, default: '82'},
  subject: {type: String, default: null},
  imageId: {type: String, default: null, uppercase: true},
  kakaoOptions: {
    senderKey: {type: String, default: null},
    templateCode: {type: String, default: null},
    buttonName: {type: String, default: null},
    buttonUrl: {type: String, default: null},
    disableSms: {type: Boolean, default: false}
  },
  dateReceived: {type: String, default: null},
  statusCode: {type: String, default: null},
  networkCode: {type: String, default: null},
  log: {type: Array, default: []},
  replacement: {type: Boolean, default: false} // 대체발송 여부, true면 대체발송된 메시지
}, {
  versionKey: false,
  id: false,
  minimize: false,
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
})

messageSchema.index({
  groupId: 1,
  accountId: 1,
  to: 1,
  from: 1,
  type: 1,
  statusCode: 1,
  dateCreated: 1,
  dateUpdated: 1
})

/**
 * messageId를 _id로 저장
 */
messageSchema.pre('save', function (next) {
  this._id = this.messageId
  next()
})

/**
 * 메시지 목록
 * @author Eden Cha
 * @param {Object} searchParams={} - 검색에 필요한 파라미터
 */
messageSchema.statics.getMessageList = async function ({
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
    messageList: {}
  }
  const { criteria, value, cond } = searchParams
  if (criteria.length && value.length && cond.length) {
    const condition = criteria.map((field, index) => {
      // 그룹아이디
      field = field === 'messageId' ? '_id' : field
      // 날짜 검색
      value[index] = ['dateCreated', 'dateUpdated'].indexOf(field) !== -1 ? new Date(moment(value[index]).utc()) : value[index]
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
  const messageList = await cursor.toArray()
  if (!messageList.length) return response
  if (messageList.length < limit) response.hasNext = 0
  Object.assign(response.messageList, ...messageList.map(data => {
    data.reason = messageStatusCodes.get(data.statusCode)
    return { [data._id]: data }
  }))
  return response
}

/**
 * @author Genie
 * @param groupId - 그룹 아이디
 * @param offset - 조회 시작할 index
 * @param limit - 조회할 개수
 * @return {*|Aggregate}
 */
messageSchema.statics.getMessagesByGroupId = async function (groupId, offset = 0, limit = 20) {
  const result = {offset, limit, totalCount: 0, messageList: {}}
  const messages = await this.find({groupId}).skip(offset).limit(limit)
  result.messageList = _.keyBy(messages, '_id')
  result.totalCount = messages.length
  return result
}

/**
 * @author Genie
 * @param groupId - 그룹 아이디
 * @function status가 2000이고 groupId와 일치하는 메시지들 타입의 갯수를 가져옴
 * @return {Promise<{sms: number, lms: number, mms: number, ata: number, cta: number, push: number}>}
 */
messageSchema.statics.getMessageTypeCountByGroupId = async function (groupId) {
  const result = await this.find({groupId, statusCode: '2000'}).select('type -_id')
  const typeCount = {
    'sms': 0,
    'lms': 0,
    'mms': 0,
    'ata': 0,
    'cta': 0
  }
  for (let i = 0; i < result.length; i++) {
    const type = result[i].type.toLowerCase()
    if (type in typeCount) {
      typeCount[type]++
    } else {
      throw new Error(`InternalError: group${groupId}의 type${type}이 잘못되었습니다.`)
    }
  }
  return typeCount
}

/**
 * @author Genie
 * @param _id - 메시지 아이디
 * @return {Query}
 */
messageSchema.statics.deleteMessageByMessageId = function (_id) {
  return this.deleteOne({_id})
}

/**
 * groupId 로 find 합니다.
 *
 * @param {stirng} groupId - 그룹 아이디
 */
messageSchema.statics.findByGroupId = function (groupId) {
  return this.find({groupId})
}

/**
 * _id 로 find 합니다.
 *
 * @param {string} _id - 메시지 아이디
 */
messageSchema.statics.findOneByMessageId = function (_id) {
  return this.findOne({_id})
}

/**
 * 여러가지 parameter 로 조회합니다.
 *
 * @param {object} obj - conditions
 */
messageSchema.query.byObject = function (obj) {
  return this.find(obj)
}

/**
 * startDate 와 endDate 를 통해 createdDate 를 조회합니다.
 *
 * @param {string | number} startDate - new Date 로 변환될 string
 * @param {string | number} endDate - new Date 로 변환될 string
 */
messageSchema.query.byDateCreated = function (startDate, endDate) {
  return this.find({dateCreated: {$gte: new Date(startDate), $lte: new Date(endDate)}})
}

/**
 * 정규표현식을 사용해 statusCode 를 조회합니다.
 *
 * @param {pattern} pattern - 정규표현식에 사용될 패턴
 */
messageSchema.query.byStatusCode = function (pattern) {
  return this.find({statusCode: new RegExp(pattern)})
}

/**
 * Message.find().paginate(offset, limit)
 *
 * @param {number | string} offset - 몇 번째부터 가져올지
 * @param {number | string} limit - 몇개를 가져올지
 */
messageSchema.query.paginate = function (offset, limit) {
  return this.skip(parseInt(offset)).limit(parseInt(limit))
}

module.exports = mongoose.model('Message', messageSchema)
