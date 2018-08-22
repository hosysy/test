/* eslint-disable no-return-await */
'use strict'

/**
 * 잔액 초기화/충전/차감 히스토리
 *
 * @author hosy <hosy@nurigo.net>
 */
const mongoose = require('mongoose')
const _ = require("lodash")

const balanceHistorySchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  oldBalance: { type: Number, required: true },
  newBalance: { type: Number, required: true },
  oldPoint: { type: Number, required: true },
  newPoint: { type: Number, required: true },
  balanceAmount: { type: Number, default: 0 },
  pointAmount: { type: Number, default: 0 },
  type: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    enum: [
      'RECHARGE', // 결제에 의한 충전
      'REWARD', // 관리자가 시스템 문제에 대한 보상
      'MANUAL', // 관리자가 임의로 지급
      'SYSTEM', // 시스템에서 자동으로 지급
      'TRANSFER', // 사용자 간의 캐쉬(balance) 이체
      'APP-PROFIT', // 앱 수익금
      'SERVICE-CHARGE', // 서비스 사용에 따른 차감 혹은 실패에 따른 환급
      'WITHDRAW'
    ]
  },
  groupId: {
    type: String,
    uppercase: true,
    trim: true,
    default: null
  },
  memo: { type: String, default: null },
  // STRIPE, BANK-TRANSFER, DEDICATED-ACCOUNT
  rechargeMethod: {
    type: String,
    uppercase: true,
    trim: true,
    default: null,
    enum: [
      null,
      'STRIPE'
    ]
  },
  // MT, MO, PHONE-NUMBER, ...
  serviceMethod: {
    type: String,
    uppercase: true,
    trim: true,
    default: null,
    enum: [
      null,
      'MT'
    ]
  },
  test: { type: Boolean }
}, {
  id: false,
  versionKey: false,
  minimize: false,
  timestamps: { createdAt: 'dateCreated' }
})


balanceHistorySchema.index({
  accountId: 1,
  groupId: 1,
  type: 1,
  rechargeMethod: 1,
  dateCreated: 1,
  balanceAmount: 1,
  pointAmount: 1
})


/**
 * 충전/차감 내역 전부 가져오기
 */
balanceHistorySchema.statics.getAll = async function ({ offset = 0, limit = 20 }) {
  return await this.find({}, { _id: false }).skip(offset).limit(limit)
}

/**
 * 조건에 맞는 충전/차감 내역 가져오기
 *
 * @params {object} - condition 
 */
balanceHistorySchema.statics.getByCondition = async function (conditions = {}) {
  const res = await this.findOne({ accountId }, { _id: false })
  if (!res) throw new Error('InvalidAccountId')
  return res
}

balanceHistorySchema.statics.findByCondition = async function (condition = {}, fields = { _id: 0 }) {
  let {
    accountId,
    offset = 0,
    limit = 20,
    startDate,
    endDate,
    balanceRecharge,
    balanceDeduct,
    pointRecharge,
    pointDeduct
  } = condition

  // 조건에 필요없는 것들 삭제
  condition = _.omit(condition, [
    'offset',
    'limit',
    'startDate',
    'endDate',
    'balanceRecharge',
    'balanceDeduct',
    'pointRecharge',
    'pointDeduct'
  ])

  // accountId 값이 있으면 확인
  if (accountId) await user.getUserBySrl(accountId)

  // offset, limit 처리
  offset = typeof offset !== 'number' ? Number(offset) : offset
  limit = typeof limit !== 'number' ? Number(limit) : limit

  // 시작일, 마지막일 검색
  if (startDate || endDate) {
    condition.dateCreated = {}
    if (startDate) condition.dateCreated['$gte'] = new Date(startDate)
    if (endDate) condition.dateCreated['$lte'] = new Date(endDate)
  }

  // 잔액 충전/차감, 포인트 충전/차감 체크박스를 위한 옵션
  condition.balanceAmount = {}
  condition.pointAmount = {}
  if (balanceRecharge === 'false') condition.balanceAmount['$lt'] = 0
  if (balanceDeduct === 'false') condition.balanceAmount['$gt'] = 0
  if (pointRecharge === 'false') condition.pointAmount['$lt'] = 0
  if (pointDeduct === 'false') condition.pointAmount['$gt'] = 0

  if (Object.keys(condition.balanceAmount).length < 1) delete condition.balanceAmount
  if (Object.keys(condition.pointAmount).length < 1) delete condition.pointAmount

  fields = { _id: 0, balanceAmount: 1, pointAmount: 1 }

  // 조건에 맞게 쿼리
  return await this.collection
    .find(condition, { fields })
    .skip(offset)
    .limit(limit)
    .sort({ dateCreated: 1 })
    .toArray()
}

module.exports = mongoose.model('BalanceHistory', balanceHistorySchema)
