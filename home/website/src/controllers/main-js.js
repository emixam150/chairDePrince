/*
 * Main Controller
 */

exports.exec = function(support) {
    support.res.setHeader('Content-Type', support.page.mime);
    $.require('makeTextResponse').send(support.content, support.headers, support.res);
} ;
