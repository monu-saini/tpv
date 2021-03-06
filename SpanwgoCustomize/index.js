'use strict'

const SPAWN = require('child_process').spawn
const DEFAULTS = require('./defaults')()
const QUERY = require('./query')

let Spanwgo = function (options) {
  this.config = Object.assign(DEFAULTS, options)
  this.allowedFileTypes = new Set(['json', 'csv', 'tsv'])
}

Spanwgo.prototype = {
  'import': function (file, str, isUpsert) {

    console.log("srt : " ,str,"       isUpsert :",isUpsert)

    let options = Object.assign({}, this.config, {'file': file})
    let querySring = QUERY['import'](options).split(' ');
    if(isUpsert == true){
      let key = str;
      let upsertFilds = '--upsertFields';
      querySring.splice(8, 0, upsertFilds, key);
    }
   // console.log('querySring querySring :::::: ', querySring)
    return SPAWN('mongoimport', querySring)
  },

  'export': function (col) {
    let options = col ? Object.assign({}, this.config, {'collection': col}) : this.config
    return SPAWN('mongoexport', QUERY['export'](options).split(' '))
  },

  'set': function (...args) {
    if (args.length === 1 && typeof args[0] === 'object') {
      this.config = Object.assign(this.config, args[0])
      return this
    } else if (args.length === 2 && typeof args[0] === 'string' && typeof args[0] === 'string') {
      this.config[args[0]] = args[1]
      return this
    }
    return new Error('Invalid argument(s) passed to .set()')
  }
}

module.exports = Spanwgo