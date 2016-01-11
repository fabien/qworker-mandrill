var EmailTemplate = require('email-templates-v2').EmailTemplate;
var juggler = require('loopback-datasource-juggler');
var Registry = require('independent-juggler');
var juice = require('juice');
var path = require('path');
var _ = require('lodash');

var rootDir = path.join(__dirname, '..');

module.exports = function(worker, task) {
    
    var registry;
    
    worker.initializer('db-connect', function(ctx, next) {
        registry = new Registry(juggler, { dir: rootDir });
        registry.connect(next);
    });
    
    worker.finalizer('db-disconnect', function(ctx, next) {
        registry.disconnect(next);
    });
    
    task.observer('juice', function(ctx, next) {
        if (ctx.job.attrs.data && _.isString(ctx.job.attrs.data.html)) {
            var settings = registry.dataSources.mandrill.settings.templates || {};
            var options = settings.options || {};
            options = _.extend({}, options.juiceOptions);
            var html = ctx.job.attrs.data.html;
            juice.juiceResources(html, options, function(err, html) {
                if (err) return next(err);
                ctx.job.attrs.data.html = html;
                next();
            });
        } else {
            next();
        }
    });
    
    task.observer('template', function(ctx, next) {
        if (ctx.job.attrs.data && _.isString(ctx.job.attrs.data.template)) {
            var templateName = ctx.job.attrs.data.template.replace(/^\.+/g, '');
            templateName = templateName.replace(/(\/|\\)/g, '');
            delete ctx.job.attrs.data.template; // template name
            
            var settings = registry.dataSources.mandrill.settings.templates || {};
            var baseDir = _.isString(settings.path) ? settings.path : null;
            baseDir = baseDir || path.join(rootDir, 'templates');
            var templateDir = path.join(baseDir, templateName);
            var template = new EmailTemplate(templateDir, settings.options || {});
            var data = _.extend({}, ctx.job.attrs.data);
            delete ctx.job.attrs.data.content; // template vars
            
            template.render(data, function (err, results) {
                if (err) return next(err);
                ctx.job.attrs.data.html = results.html || ctx.job.attrs.data.html;
                ctx.job.attrs.data.text = results.text || ctx.job.attrs.data.text;
                ctx.job.attrs.data.subject = results.subject || ctx.job.attrs.data.subject;
                next();
            });
        } else {
            next();
        }
    });
    
    worker.task(task.id, function(job, done) {
        var Email = registry.models.Email;
        var data = job.attrs.data;
        if (Object.keys(data).length === 0) return done(); // skip
        if (process.env.NODE_ENV === 'test') {
            console.log(JSON.stringify(data, null, 4));
            done();
        } else {
            Email.send(data, done);
        }
    });
    
};