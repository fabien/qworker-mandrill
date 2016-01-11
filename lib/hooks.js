var crypto = require('crypto');
var async = require('async');
var _ = require('lodash');

// Handle Mandrill hooks using Express Middleware

module.exports = function(options, defaultContext) {
    var apiKey = options.apiKey;
    
    if (!apiKey) throw new Error('No Mandrill api key set');
    
    var eventNames = ['send', 'hard_bounce', 'soft_bounce', 'open', 'click', 'spam', 'unsub', 'reject', 'inbound'];
    var events = options.events ? _.intersection(options.events || [], eventNames) : eventNames; // selective or all
    
    var eventHandler = options.eventHandler || function(event, next) { process.nextTick(next); };
    
    var validateEvent = function(eventName) {
        return _.include(events, eventName);
    };
    
    return function(req, res, next) {
        if (req.method !== 'POST') return next();
        var url = req.protocol + '://' + options.baseUrl + req.originalUrl;
        var param = reqParam.bind(null, req);
        if (validateEvent(param('event')) && verifyRequest(req, apiKey, url)) {
            var events = req.body['mandrill_events'];
            if (_.isArray(events) && !_.isEmpty(events)) {
                var context = defaultContext || req.app;
                var handler = eventHandler.bind(context);
                async.forEach(events, function(event, next) {
                    if (!validateEvent(event.event)) return next();
                    handler(event, next);
                }, function(err, results) {
                    res.status(err ? 400 : 200).end();
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(404).end();
        }
    };
};

function createSignature(apiKey, url, params) {
    var signed = url, params = _.extend({}, params);
    var keys = _.keys(params).sort();
    _.each(keys, function(key) {
        signed += key + params[key].toString();
    });
    var hmac = crypto.createHmac('sha1', apiKey); 
    hmac.update(signed);
    return hmac.digest('base64');
};

function verifyRequest(req, apiKey, url) {
    var signature = req.get('X-Mandrill-Signature');
    if (_.isEmpty(signature)) return false;
    var signed = createSignature(apiKey, url, req.body);
    return signature === signed;
};

function reqParam(req, name, defaultValue) {
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};
    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query[name]) return query[name];
    return defaultValue;
};

module.exports.createSignature = createSignature;
module.exports.verifyRequest = verifyRequest;