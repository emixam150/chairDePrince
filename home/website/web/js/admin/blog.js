window.onload =function() {

    var socket =  io.connect();
 
    /*
     * Accueil 
     */



//    var nouveau_button = document.getElementById('nouveau_button');

var listHTML = document.getElementById('objects-list'),
    bornHTML = document.getElementById('born-date'),
    lastUpdateHTML = document.getElementById('last-update'),
    titleTXT = document.getElementById('title-txt'),
    changeTitleBUT = document.getElementById('change-title'),
    publishCHECK = document.getElementById('publish-check'),
    introTXT = document.getElementById('intro-txt'),
    introCHECK = document.getElementById('intro-check'),
    contentTXT = document.getElementById('cont-txt'),
    controlHTML = document.getElementById('control'),
    newBUT = controlHTML[0];

var Admin= function(){
    
    var adm = this;
    adm.current = undefined;
    this.listLI = [];

    this.refreshList = function(list){
	listHTML.innerHTML = "";
	adm.list = list;
	for(var i = 0; i<list.length; i++){
	    var li = document.createElement('li');
	    li.onclick = function(e){
		adm.get(e.target.getAttribute('data-id'))
	    };
	    li.setAttribute('data-id',list[i].id)
	    li.innerHTML = list[i].content;
	    listHTML.appendChild(li);
	}
    }

    this.load = function(elt){
	console.log(elt);
	bornHTML.innerHTML = new Date(elt.bornDate).toLocaleDateString();
	lastUpdateHTML.innerHTML = new Date(elt.lastUpdate).toLocaleDateString();
	titleTXT.innerHTML = elt.title;
	console.log(elt.published);
	publishCHECK.checked = elt.published;
	contentTXT.value = elt.content;
	introCHECK.checked = typeof elt.intro == "string";
	introTXT.disabled = !(typeof elt.intro == "string");
	if(typeof elt.intro == "string")
	    introTXT.value = elt.intro;
	adm.current = elt;
    }

    this.update = function(content,sectionKey){
	
    }

    this.get= function(id){
	console.log(id);
	socket.emit('get',id)
    }

    this.init = function(){
	socket.on('list',function(list){
	    adm.refreshList(list);
	})

	socket.on('warning', function(message){console.log(message)})

	socket.on('new',function(elt){
	    adm.load(elt);
	})

	socket.on('titleChanged',function(title){
	    titleTXT.innerHTML = title;
	    adm.current.title = title;
	})

	socket.on('changePublishState',function(state){
	    publishCHECK.checked = state;
	    adm.current.published = state;
	})

	socket.on('changeIntro',function(state){
	    introCHECK.checked = state;
	    introTXT.disabled = !state; 
	    adm.current.intro = state;
	})
	
	newBUT.onclick = function(){
	    var title = prompt("Titre : ");
	    if(title && title != '')
		socket.emit('new',title);
	}

	contentTXT.onkeyup = function(e){
	    console.log(e.target.value);
	    socket.emit('updateSubTree','article',e.target.value);
	}

	introTXT.onkeyup = function(e){
	    console.log(e.target.value);
	    if(adm.current.intro)
		socket.emit('updateSubTree','intro',e.target.value);
	}

	introCHECK.onchange = function(e){
	    socket.emit('changeIntro', introCHECK.checked);
	}

	changeTitleBUT.onclick = function(e){
	    var newTitle = prompt("Nouveau Titre",adm.current.title);
	    if(newTitle && newTitle !="")
		socket.emit('changeTitle',newTitle);
	}
	
	publishCHECK.onchange = function(e){
	    var state = publishCHECK.checked;
	    socket.emit('changePublishState', state);
	}

	introTXT.value = ""; contentTXT.value = "";
	socket.emit('list');
    }


    }

var admin =  new Admin();
    admin.init();
    
    
}
