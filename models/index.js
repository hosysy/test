/**
 * API V4 에 대한 몽구스 스키마 모음
 *
 * @author Henry Kim <henry@nurigo.net>
 */
'use strict'

const fs = require('fs')
/*
const { setOptions, options, mongoose } = require('@nurigo/validator')()
setOptions({
  exceptModels: [].concat(options.exceptModels, ['Message', 'Group'])
})
*/

// 현재 디렉터리의 모든 js파일을 모델로 간주하고 export합니다.
fs.readdirSync(__dirname).forEach(fileName => {
  const matches = fileName.match(/^(?!index\.js)(.+)\.js$/)
  if (!matches) return
  let modelName = matches[1]
  modelName = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  const model = require(`./${fileName}`)
  // 해당 schema에 정의된 validation이 존재할 경우 검사를 진행합니다.
  // mongoose(model, 'messages-v4')
  module.exports[modelName] = model
})
