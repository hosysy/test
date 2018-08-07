/* eslint-disable no-return-await */
'use strict'

/**
 * 단가
 *
 * @author hosy <hosy@nurigo.net>
 */
const mongoose = require('mongoose')

const pricingSchema = new mongoose.Schema({
  _id: { type: String },
  countryId: { type: String, required: true },
  countryName: { type: String, required: true },
  sms: { type: Number, default: 0 },
  lms: { type: Number, default: 0 },
  mms: { type: Number, default: 0 },
  ata: { type: Number, default: 0 },
  cta: { type: Number, default: 0 },
  count: { type: Object }
}, {
  id: false,
  versionKey: false,
  minimize: false,
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
})

pricingSchema.statics.createNew = async function () {
  console.log('in here')
  await this.update({ cash: 9999}, {
    cash: 99999
  }, { upsert:true })
}

module.exports = mongoose.model('Pricing', pricingSchema)


