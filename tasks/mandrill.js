var juggler = require('loopback-datasource-juggler');
var Registry = require('independent-juggler');
var path = require('path');

module.exports = function(worker, task) {
    
    var registry = new Registry(juggler, {
        dir: path.join(__dirname, '..')
    });
    
    worker.initializer('db-connect', function(ctx, next) {
        registry.connect(next);
    });
    
    worker.finalizer('db-disconnect', function(ctx, next) {
        registry.disconnect(next);
    });
    
    worker.task(task.id, function(job, done) {
        var Email = registry.models.Email;
        var data = job.attrs.data;
        if (Object.keys(data).length === 0) return done(); // skip
        Email.send(data, done);
    });
    
};