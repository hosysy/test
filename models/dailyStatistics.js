/**
 * 메시지 일별 통계
 * statistics에서 일정시간마다 데이터를 가져와 쌓는 일별 통계 데이터
 *
 * @author hosy <hosy@nurigo.net>
 */
'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')

const dailyStatisticsSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  date: { type: Date, required: true },
  count: { type: Object, required: true },
  appId: { type: String, default: null },
  balance: { type: Number, default: 0 },
  point: { type: Number, default: 0 },
  taxIssued: { type: Boolean, default: false }, // 세금계산서 발행 여부
  profitSettlement: { type: Boolean, default: false } // 정산 여부
}, {
  id: false,
  versionKey: false,
  minimize: false
})

dailyStatisticsSchema.index({ accountId: 1, appId: 1, date: 1 }, { unique: true })
dailyStatisticsSchema.index({ count: 1 })

/**
 * 통계내역 가져오기
 *
 * @params condition {object} - 검색을 위한 조건들 아래와 같이 들어갈 수 있다.
 *   {
 *     accountId, // 사용자 accountId (관리자일 경우)
 *     appId, // 앱 아이디
 *     taxIssued, // 세금계산서 발행 여부
 *     profitSettlement, // 수익정산 여부
 *     startDate, // 검색할 처음 날짜
 *     endDate, // 검색할 마지막 날짜
 *     offset,
 *     limit
 *   }
 * @params {object} fields - 가져올 필드
 */
dailyStatisticsSchema.statics.findByCondition = async function (condition = {}, fields = { _id: 0 }) {
  let {
    accountId,
    startDate,
    endDate,
    offset = 0,
    limit = 20
  } = condition

  console.log('check taxissued', condition.taxIssued, typeof condition.taxIssued)

  // 조건에 필요없는 것들 삭제
  condition = _.omit(condition, ['offset', 'limit', 'startDate', 'endDate'])

  offset = typeof offset !== 'number' ? Number(offset) : offset
  limit = typeof limit !== 'number' ? Number(limit) : limit

  // 시작일, 마지막일 검색
  if (startDate || endDate) {
    condition.date = {}
    if (startDate) condition.date['$gte'] = new Date(startDate)
    if (endDate) condition.date['$lte'] = new Date(endDate)
  }

  // 조건에 맞게 쿼리
  const res = await this.collection
    .find(condition, { fields })
    .skip(offset)
    .limit(limit)
    .sort({ date: -1 })
    .toArray()
  return res
}

module.exports = mongoose.model('DailyStatistics', dailyStatisticsSchema)
