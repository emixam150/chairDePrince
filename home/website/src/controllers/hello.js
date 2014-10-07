/*
 * Hello Controller
*/
var mustache = $.require('mustache');

exports.exec = function(support) {
    var isEmpty = (support.page.query.name == '' || support.page.query.cri =='')? true: false;
    var output = mustache.render(support.content, {'empty': isEmpty,'name': support.page.query.name , 'cri' : support.page.query.cri });

    support.res.setHeader('Content-Type', 'text/html');
    
    support.res.setHeader('Cache-Control','max-age=' + support.page.maxAge );

    $.require('makeTextResponse').send(output, support.headers, support.res);
} ;
