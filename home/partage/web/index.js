var app = require('./app.js');

exports.run = function(req, res, srv) {
    app.start(req, res, srv);
}