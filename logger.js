/**
 * @file: logger
 * @author: gejiawen
 * @date: 9/25/16 10:27
 * @description: logger
 */

const path = require('path')
const fs = require('fs')
const bunyan = require('bunyan')
const config = require('./config.log.json')

let logCache = [];

function _detectLogFilePath() {
    const folderPath = path.resolve(config.logFolder)
    const exist = fs.existsSync(folderPath)

    if (!exist) {
        try {
            fs.mkdirSync(folderPath)
        } catch (ex) {
            throw new Error(ex)
        }
    }

    const fileName = config.logPrefix + new Date().toLocaleDateString().replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2') + '.log'

    return path.resolve(config.logFolder, fileName)
}

const logger = bunyan.createLogger({
    name: config.logRecordName,
    src: config.logSrc,
    streams: [
        {
            path: _detectLogFilePath()
        }
    ]
})

config.enableSaveInterval && _saveInterval()

logger.addSerializers({
    // req: bunyan.stdSerializers.req, //s_req,
    // res: bunyan.stdSerializers.res, // s_res,
    req: s_req,
    res: s_res,
    err: s_err
})

// serializers

function s_req(req) {
    if (!req) {
        return false;
    }

    return ({
        query: (typeof req.query === 'function') ? req.query() : req.query,
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        httpVersion: req.httpVersion,
        trailers: req.trailers,
        body: req.body || undefined,
        clientClosed: req.clientClosed
    })
}

function s_res(res) {
    if (!res) {
        return false
    }

    return ({
        statusCode: res.statusCode,
        // headers: res._header,
        headers: res._headers,
        trailer: res._trailer || false,
        body: res._body
    })
}

function s_err() {
    return bunyan.stdSerializers.err
}


// recorders

function r_wrapper(level) {
    // return (msg) => {
    //     logger[level]({
    //         category: level
    //     }, msg)
    // }
    return (msg) => {
        _cacheRecord({
            level: level,
            category: level,
            msg: msg
        })
    }
}

function r_request(level) {
    return (req, msg) => {
        _cacheRecord({
            level: level || 'info',
            category: 'request',
            name: 'req',
            value: req,
            msg: msg || 'start request'
        })
    }
}

function r_response(level) {
    return (res, msg) => {
        _cacheRecord({
            level: level || 'info',
            category: 'response',
            name: 'res',
            value: res,
            msg: msg || 'done response'
        })
    }
}

function r_template() {

}

// save interval
function _cacheRecord(record) {
    if (config.enableSaveInterval) {
        logCache.push(record)
    } else {
        _save(record)
    }
}

function _saveInterval() {
    setInterval(() => {
        if (!logCache.length) {
            return
        }

        logCache.forEach((record) => {
            _save(record)
        })
        _cleanLogCache()
    }, config.logSaveInterval)
}

function _save(record) {
    const level = record.level
    const category = record.category
    const name = record.name
    const value = record.value
    const msg = record.msg

    const options = {}
    options.category = category
    name && (options[name] = value)

    logger[level](options, msg)
}

function _cleanLogCache() {
    logCache = []
}

// expose

const recorders = {
    fatal: r_wrapper('fatal'),
    error: r_wrapper('error'),
    warn: r_wrapper('warn'),
    info: r_wrapper('info'),
    debug: r_wrapper('debug'),
    trace: r_wrapper('trace'),
    request: r_request(),
    response: r_response(),
    template: r_template()
}

module.exports = recorders


/**
 * TODO
 * 介绍logger的使用
 *
 */
// module.exports = {
//     fatal: wrapper('fatal'),
//     error: wrapper('error'),
//     warn: wrapper('warn'),
//     info: wrapper('info'),
//     debug: wrapper('debug'),
//     trace: wrapper('trace'),
//     log: wrapper('info'),
//     child: child,
//     // TODO
//     // 为了让每一个请求和响应相匹配，需要针对res和req额外增加一个外键约束
//     req: req(),
//     res: res()
//     // TODO 模板文件的请求日志
//     // template: template()
// }
