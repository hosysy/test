/**
 * 사용하는 패키지별로 사용가능한 모델들 분리
 *
 * @author Henry Kim <henry@nurigo.net>
 * @author Billy Kang <billy@nurigo.net>
 */
'use strict'

const mongoose = require('mongoose')

/* eslint-disable */
const companySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: getUniqId
  },
  accountId: {
    type: String,
    index: true,
    unique: true
  },
  name: String,               // 법인명 (단체명)
  owner: String,              // 대표자
  address: String,
  businessNumber: String,     // 사업자 정보
  businessType: String,       // 업태
  businessItems: String,      // 종목
  contacts: [{                // 담당자
    name: String,             // 담당자 이름
    email: String,            // 담당자 email
    phone: String             // 담당자 연락처
  }]
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
})
/* eslint-enable */

companySchema.index({ accountId: 1, businessNumber: 1 })

companySchema.statics.create = async function (payload) {
  const { accountId, contacts } = payload
  const company = await this.findOne({ accountId })
  if (company) throw new Error('CompanyAlreadyExists')
  if (contacts.length < 1) throw new Error('InvalidCompanyContacts')
  const { _id: companyId } = await new Company(payload).save()
  return companyId
}

companySchema.statics.findOneByAccountId = function (accountId) {
  return this.findOne({ accountId })
}

companySchema.methods.updateCompany = async function (payload) {
  const { contacts } = payload
  if (contacts.length < 1) throw new Error('InvalidCompanyContacts')
  return this.constructor.update({ _id: this._id }, payload).exec()
}

/**
 * 숫자로만 이루어진 유니크한 값을 출력시킵니다.
 */
function getUniqId () {
  return `${Math.floor(process.hrtime().reduce((p, c) => p + c) * Date.now() / 1000)}${Date.now()}`
}

const Company = mongoose.model('Company', companySchema)
module.exports = Company
