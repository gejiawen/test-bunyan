/**
 * @file: index
 * @author: gejiawen
 * @date: 9/24/16 19:56
 * @description: index
 */

// const bunyan = require('bunyan')
//
// const logger = bunyan.createLogger({
//     name: 'test',
//     streams: [
//         {
//             // level: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
//             path: './test.log'
//         }
//     ]
// })
//
// logger.info('foo')
// logger.warn('bar')

const http = require('http')
const logger = require('./logger')

// logger.info('hi')

http.createServer((req, res) => {
    logger.request(req)
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('hello')
    logger.response(res)

}).listen(3000, '127.0.0.1', () => {
    logger.info('start listening')

    const options = {
        port: 3000,
        hostname: '127.0.0.1',
        path: '/path?q=1',
        headers: {
            'X-Hi': 'Mom'
        }
    }
    const req = http.request(options)

    req.on('response', function (res) {
        res.on('end', function () {
            process.exit();
        })
    })

    req.write('hi from the client');
    req.end()
})



