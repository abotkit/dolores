const chalk = require('chalk')
const puppeteer = require('puppeteer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async function() {
  console.log(chalk.green('Setup Puppeteer'))
  const browser = await puppeteer.launch({
  	dumpio: true,
  	headless: process.argv[5].split('=')[1] === 'true',
  	args: [
  		'--no-sandbox', 
  		'--disable-setuid-sandbox', 
  		'--disable-dev-shm-usage',
  	]
  });
  global.__BROWSER_GLOBAL__ = browser
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
