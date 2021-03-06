// Example handling an fs error for a Bunyan-created
// stream: we create a logger to a file that is read-only.

var fs = require('fs')
var path = require('path')
var bunyan = require('bunyan')

var FILENAME = 'handle-fs-error.log'
var S_IWUSR = 0o200 // mask for owner write permission in stat mode

console.warn('- Log file is "%s".', FILENAME)

if (!fs.existsSync(FILENAME)) {
    console.warn('- Touch log file.')
    fs.writeFileSync(FILENAME, 'touch\n')
}
if (fs.statSync(FILENAME).mode && S_IWUSR) {
    console.warn('- Make log file read-only.')
    fs.chmodSync(FILENAME, 0o444)
}

console.warn('- Create logger.')

var log = bunyan.createLogger({
    name: 'handle-fs-error',
    streams: [
        {path: FILENAME}
    ]
})

log.on('error', function (err) {
    console.warn('- The logger emitted an error:\n', err)
})

console.warn('- Call log.info(...).')
log.info('info log message')
console.warn('- Called log.info(...).')

setTimeout(function () {
    console.warn('- Call log.warn(...).')
    log.warn('warn log message')
    console.warn('- Called log.warn(...).')
}, 1000)
