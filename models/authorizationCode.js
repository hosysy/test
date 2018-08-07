'use strict'

const mongoose = require('mongoose')
const authorizationCodeSchema = new mongoose.Schema({
  _id: String,
  code: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: String,
    required: true,
    ref: 'Client'
  },
  accountId: {
    type: Number,
    required: true
  },
  redirectUri: {
    type: String,
    required: true,
    // match: /^(https|http)?:\/\/(\w*:\w*@)?[-\w.]+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?$/
    match: /^(https|http)/
  },
  scope: [{
    type: String,
    ref: 'Scope'
  }], // ex) ['user:*', 'test:*', ...],
  state: {
    type: String,
    required: true
  },
  dateExpired: {
    type: Date,
    required: true
  }
})
authorizationCodeSchema.index({ dateExpired: 1 }, { expireAfterSeconds: 0 })
authorizationCodeSchema.index({ code: 1 })

authorizationCodeSchema.pre('save', function (next) {
  this._id = this.code
  next()
})

module.exports = mongoose.model('AuthorizationCode', authorizationCodeSchema)
