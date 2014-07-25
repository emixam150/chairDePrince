exports.exec = function(res, ressourcePath ,content, page) {
    var mustache = $.require('mustache');
    var isEmpty = (page.query.name == '' || page.query.cri =='')? true: false;
    var output = mustache.render(content, {'empty': isEmpty,'name': page.query.name , 'cri' : page.query.cri });

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(output,'utf8');
} ;
