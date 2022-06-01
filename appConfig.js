const Path = require('path')
const APP_DIR = process.env.APP_DIR || process.cwd()
const configPath = Path.resolve(__dirname, APP_DIR, 'config.json')
console.log('CONFIG=', configPath)
const config = require(configPath)
config.APP_DIR = APP_DIR
module.exports = config
