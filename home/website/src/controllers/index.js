/*
 *Index Controller
*/
exports.exec = function(res, ressourcePath, content, page) {
    var mustache = $.require('mustache');
    var output = mustache.render(content, {'name': page.query.name });

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(output,'utf8');
} ;
