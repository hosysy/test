'use strict'

const mongoose = require('mongoose')
const refreshTokenSchema = new mongoose.Schema({
  _id: String,
  refreshToken: {
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
  scope: [{
    type: String,
    ref: 'Scope'
  }]
}, {
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: false
  }
})

refreshTokenSchema.index({ clientId: 1, accountId: 1 })

refreshTokenSchema.pre('save', function (next) {
  this._id = this.refreshToken
  next()
})

module.exports = mongoose.model('RefreshToken', refreshTokenSchema)
