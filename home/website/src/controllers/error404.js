/*
* Error404 Controller
*/

exports.exec = function(res, content, ressourcePath, page, post) {
    var mustache = $.require('mustache');
    //var output = mustache.render(content, {'name': query.name });

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(content,'utf8');
} ;
