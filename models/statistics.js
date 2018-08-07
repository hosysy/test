/**
 * 메시지 실시간 통계
 * groupUpdater에서 그룹이 complete될 때 쌓는 데이터
 *
 * @author hosy <hosy@nurigo.net>
 */
'use strict'

const mongoose = require('mongoose')

const statisticsSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  date: { type: Date, required: true },
  count: { type: Object, required: true },
  appId: { type: String, default: null },
  balance: { type: Number, default: 0 },
  point: { type: Number, default: 0 }
}, {
  id: false,
  versionKey: false,
  minimize: false
})

// statisticsSchema.index({ accountId: 1, appId: 1, date: 1 }, { unique: true })
statisticsSchema.index({ count: 1 })
statisticsSchema.index({ accountId: 1 })
statisticsSchema.index({ appId: 1 })
statisticsSchema.index({ date: 1 })

module.exports = mongoose.model('Statistics', statisticsSchema)
