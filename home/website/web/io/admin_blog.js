var paths = require($.paths),
tempModel = require(paths.models + '/template.js'),
Blog = require(paths.models + '/blog.js'),
fs = require('fs');


exports.exec = function(socket){

     var current = null

     socket.on('list',function(){
 	buildList(function(list){
 	    socket.emit('list',list);
 	})
     });
    
     //mise en place de la connexion

     socket.on('new', function(title){
 	newElt = new Blog();
 	newElt.addByTitle(title,function(err,result){
	    if(err){
		socket.emit('warning','Adding failed: '+err.message);
 	    }else{
 		current = newElt;
 		buildList(function(list){
 		    socket.emit('list',list);
 		})
 		socket.emit('new', {
		    title : current.content.title,
		    published : current.published,
		    content: current.content.tree.children.article.content,
 		    bornDate: current.bornDate,
 		    lastUpdate: current.lastUpdate})
 	    }
 	})
     })
    
     socket.on('get', function(id){
 	 var loadingElt = new Blog()
 	loadingElt.getById(id, function(err){
 	    if(err){
 		socket.emit('warning', 'Loading  failed: '+err.message)
 	    }else{
 		buildList(function(list){
 		    socket.emit('list',list);
 		})
 		current = loadingElt;
// 		refreshDisplay()
		console.log(current.advert,'ad');
 		    socket.emit('new', {
			title : current.content.title,
			published : current.published,
			intro :(current.content.tree.children.intro)? current.content.tree.children.intro.content: undefined,
			advert :(current.content.advert)? current.content.advert: undefined,
			content: current.content.tree.children.article.content,
 			bornDate: current.bornDate,
 			lastUpdate: current.lastUpdate})
 	    }
 	})
     })

    var oldSectionKey = "",
    OldContent = " " ,
    isTipping = false

    socket.on('updateSubTree', function(sectionKey, newContent){
	if(current != null){
	    if(oldSectionKey != sectionKey){ // on a changé de subTree
		if(oldSectionKey != ""){ // si on a pas init
		    current.updateSubTree(oldSectionKey, OldContent,function(err){
			//refreshDisplay()
			if(err)
			    socket.emit('warning',"impossible to upadate the subTree " + oldSectionKey+ " : "+ err.message)
			else
			socket.emit('subTreeUpdated')
		    })
		}
		current.updateSubTree(sectionKey, newContent,function(err){
		    //refreshDisplay()
		    OldContent = newContent // initialisation
		    oldSectionKey = sectionKey
		    if(err)
			socket.emit('warning',"impossible to upadate the subTree " + oldSectionKey+ " : "+ err.message)
		    else
			socket.emit('subTreeUpdated')
		})
	    }else{
		OldContent = newContent    // on stocke
		if(!isTipping){ // ca fait plus d'une sec
		    isTipping = true
		    setTimeout(function(){
			isTipping = false
			current.updateSubTree(oldSectionKey, OldContent,function(err){
			    //refreshDisplay()
			    if(err)
				socket.emit('warning',"impossible to upadate the subTree " + sectionKey+ " : "+ err.message)
			    else
				socket.emit('subTreeUpdated')
			})		
		    },1000)
		}
	    }
	}
    })
    

var OldContent2 = "",
isTipping2 = false;
socket.on('updateAdvert', function(newContent){
    OldContent2 = newContent    // on stocke
    if(!isTipping2){ // ca fait plus d'une sec
	isTipping2 = true
	setTimeout(function(){
	    isTipping2 = false
	    current.updateAdvert(OldContent2,function(err){
		//refreshDisplay()
		if(err)
		    socket.emit('warning',"impossible to upadate the advert  :" + err.message)
		else
		    socket.emit('advert updated')
	    })		
	},1000)
    }
})

    socket.on('changeTitle', function(title){
	var oldTitle  = current.content.title
	if(current != null){
	    current.setTitle(title, function(err){
		//refreshDisplay()
		if(err)
		    socket.emit('warning', 'impossible to change title of '+ oldTitle+ ' to '+title+' : '+ err.message)
		else
		    socket.emit('titleChanged',title)
	    })
	}
    })


    socket.on('changePublishState', function(state){
	if(current != null)
	    current.setPublishState(state,function(err){
		if(err)
		    socket.emit('warning', "impossible to change the publish's stateof "+ current.title+ " : " + err.message)
		else
		    socket.emit('changePublishState',state);
	    })
    })


    socket.on('changeIntro', function(state){
	if(current != null)
	    if(state){
		current.addIntro(function(err){
		    if(err)
			socket.emit('warning', "impossible to add intro of "+ current.title+ " : " + err.message)
		    else
			socket.emit('changeIntro',state);
		})
	    }else{
		current.rmIntro(function(err){
		    if(err)
			socket.emit('warning', "impossible to remove intro of "+ current.title+ " : " + err.message)
		    else
			socket.emit('changeIntro',state);
		})
	    }
	
    })

 var buildList = function(cb){
     //listage
     var  b = new Blog(),
     limitSize = 100000,
     query ={},
     projection = {content: 1 };
    
     b.findPlus(query, projection, { lastUpdate: -1 }, limitSize, function(docs){
 	var list = [],
 	cpt = 0;
 	 for(var elt in docs){
 	     list.push({content: docs[elt].content.title,
 			id: String(docs[elt]._id)});
 	     cpt++;
 	     if(cpt == docs.length)
 		cb(list)
	 }
	 if(docs.length == 0)
	     cb(list)
     })
 }


}
