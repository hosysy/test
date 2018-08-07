'use strict'

/**
 * @module
 * @author Genie, Henry
 * [공식 문서]{@link https://docs.nurigo.net/3.%20ms/1.%20oauth2/04.%20authorizeDecision.html}
 *
 * scopeSchema 모델 파일입니다.
 */
const mongoose = require('mongoose')
const scopeSchema = new mongoose.Schema({
  _id: String,
  name: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    required: true,
    match: /^(ACTIVE|INACTIVE)$/
  },
  displayName: {
    type: String,
    required: true
  },
  displayDescription: {
    type: String,
    required: true
  }
}, {
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: false
  },
  versionKey: false
})

/**
 * @function
 * @author Genie
 * @param {Array<String>} scopeList - 유효성을 검사할 scope의 목록입니다.
 * @param {String} type - 반환값을 결정할 type 입니다.
 *                      - 'get' -> 스코프의 전반적인 정보를 가져옵니다.
 *                      - undefined -> 스코프의 이름만 가져옵니다.
 * @return Promise
 *
 * 넘어오는 scopeList에 대한 유효성을 검사하고 type에 따라 반환값이 달라집니다.
 * 1. scopeList에 중복되는 scope가 있는지 검사
 * 2. 잘못된 scope이름을 넣었는지 검사
 * 3. 비활성화 상태인 scope를 넣었는지 검사
 * 4. type에 따라 값을 저장후 반환
 */
scopeSchema.static('checkScope', function (scopeList, type) {
  return new Promise(async (resolve, reject) => {
    if (!scopeList.length) return reject(new Error(`InvalidScope:존재하지 않는 scope를 입력 하셨습니다.`))
    // 중복되는 scope가 있는지 검사
    const isGet = type === 'get'
    const sortedScopes = scopeList.sort()
    for (let i = 0; i < sortedScopes.length - 1; i++) {
      if (sortedScopes[i + 1] === sortedScopes[i]) {
        return reject(new Error(`DuplicatedScope:중복되는 scope(${sortedScopes}) 입력`))
      }
    }
    const findData = isGet ? '-_id name status displayName displayDescription dateCreated' : 'name status -_id'
    const scopes = await this.find({ _id: { $in: sortedScopes } }, findData)
    if (scopes.length !== sortedScopes.length) {
      return reject(new Error(`InvalidScope:존재하지 않는 scope를 입력 하셨습니다.`))
    }
    let result = []
    for (let i = 0; i < scopes.length; i++) {
      if (scopes[i].status !== 'ACTIVE') {
        return reject(new Error(`InactiveScope:비활성화 상태인 Scope 입력(${scopes[i].name} is ${scopes[i].status})`))
      }
      isGet ? result.push(scopes[i]) : result.push(scopes[i].name)
    }
    resolve(result)
  })
})

scopeSchema.pre('save', function (next) {
  this._id = this.name
  next()
})

module.exports = mongoose.model('Scope', scopeSchema)
