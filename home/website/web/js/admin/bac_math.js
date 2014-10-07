window.onload =function() {

    var socket =  io.connect();

    /*
     * Accueil 
     */
    var currentContent = null;
    var ouvrir_button = document.getEllementById('ouvrir_button'),
    nouveau_button = document.getElementById('nouveau_button');
    socket.emit('math', currentContent);
    socket.on('math', function(content){
	if(content == null){
	    if(confirm('Voulez-vous creer un nouvel élément')){
		var recup = null;
		while(recup == null || recup == '')
		    recup = prompt('Titre :', '');
		socket.emit('newTitleMath',recup);
	    }else{
		var recup = null;
		while(recup == null || recup == '')
		    recup = prompt('Nom de l\'élement à charger:', '');
		socket.emit('loadName',recup);
	    }
	}else;
	//mettre en place les valeurs des eltmaths
    });
    
    /*
     * Affichage et MAJ
     */


    socket.on('newContentMath', function(newContent){
	currentContent = newContent;

	var listBloc = ['cont', 'dem', 'rem', 'ex', 'exo'],
	    addBloc = ['dem', 'rem', 'ex', 'exo'],
	    nameOnBlur = listBloc[0],
	    objectOnBlur = undefined, 
	    indexFig = 0;

	if( typeof currentContent.tree == 'undefined'){ 
	    currentContent.tree = {
		"id": "section",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    };
	}else
	    loadContent(currentContent);

	//loading time

	function loadTemp(listTemp, eltId){
	    for(var temp =0; temp<listTemp.length; temp++){
		if(listTemp[temp].type == "figure"){
		    var liAdded = addLi(document.getElementById('ad'+eltId),makeLiFigure(listTemp[temp].id));
			    
		    for(var query in listTemp[temp].queries){
			liAdded.getElementsByClassName(query)[0].value = listTemp[temp].queries[query];
			addUpdateEvent(liAdded.getElementsByClassName(query)[0], listTemp[temp].queries,query);
		    }
		}
	    }
	}

	function loadContent(content){
	    for(var child=0;child<content.tree.children.length; child++){
		document.getElementsByName(content.tree.children[child].id)[0].value = content.tree.children[child].content;
		loadTemp(content.tree.children[child].children,content.tree.children[child].id);
	    }
	    send(currentContent);
	}
	
	// librairies

	function insertAtCursor(myField, myValue) {
	    //IE support
	    if (document.selection) {
		myField.focus();
		var sel = document.selection.createRange();
		sel.text = myValue;
	    }
	    //MOZILLA and others
	    else if (myField.selectionStart || myField.selectionStart == '0') {
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos)
		    + myValue
		    + myField.value.substring(endPos, myField.value.length);
	    } else {
		myField.value += myValue;
	    }
	}

	function addLi(eltToAdd,li){
	    var liElt = document.createElement("li"),
		done = false;
            liElt.innerHTML = li;
	    for(var child in eltToAdd.children){
		if(child.tagName == 'ul'){
		    child.appendChild(liElt);
		    done = true;
		}
	    }
	    if(!done){
		var ul = document.createElement('ul');
		ul.appendChild(liElt);
		eltToAdd.appendChild(ul);
	    }
	    return liElt;
	}
	
	function addUpdateEvent(inputObject, objectInContent, index){
	    inputObject.addEventListener('keyup',function(){
		objectInContent[index] = this.value;
		send(currentContent);
            });
	}


     // gestion des figures

	function makeLiFigure(index){
	    return '<span>Figure n°'+index+'</span><br/>'
		+ 'lien: <input class="link" type="text"/><br/>'
		+ 'alt: <input class="alt" type="text"/><br/>'
		+  'description: <input class="description" type="text"/>';
	}

	document.getElementById('figure').addEventListener('click',function(){

	    var elt = document.getElementsByName(nameOnBlur)[0],
		liAdded = addLi(document.getElementById('ad'+nameOnBlur),makeLiFigure(indexFig)),
		figureTreeBloc = {
		    "id": 'fig'+indexFig,
		    "type": "figure",
		    "content":"",
		    "children":[],
		    "queries":{
			"link":"",
			"description": "",
			"alt":""
		    }
		};
	    
	    currentContent.tree.children[listBloc.indexOf(nameOnBlur)].children.push(figureTreeBloc);
	    insertAtCursor(elt,'{{{fig'+indexFig+'}}}');
	    for(var query in figureTreeBloc.queries){
		addUpdateEvent(liAdded.getElementsByClassName(query)[0], figureTreeBloc.queries, query);
		liAdded.getElementsByClassName(query)[0].addEventListener('keyup',function(){
		    currentContent.tree.children[listBloc.indexOf(nameOnBlur)].content = document.getElementsByName(nameOnBlur)[0].value;
		});
	    }


	    indexFig++;
	    send(currentContent);
	});    
	

	//gestion du type
	
	document.getElementById("type").addEventListener('change', function(){
	    currentContent.type = document.getElementById('type').value;
	    send(currentContent);
	});

	//gestion du titre
	(function(){
	    var elt = document.getElementsByName('title')[0];
	    elt.value = currentContent.title;
	    
	    elt.addEventListener('keyup', function(){
		currentContent.title = elt.value;
		send(currentContent);
	    });

	})();
	
	// gestion du contenu
	
	function update(index, blocName){
	    var elt = document.getElementsByName(blocName)[0];
	    var treeBloc = {};
	    if(currentContent.tree.children[index])
		treeBloc = currentContent.tree.children[index];
	    else
		treeBloc = {
		    "id": blocName,
		    "type": "part",
		    "content":"",
		    "children":[],
		    "queries":{}
		};

	    elt.addEventListener('keyup', function(){
		treeBloc.content = elt.value;
		currentContent.tree.children[index] = treeBloc;
		send(currentContent);
	    });
	    
	    elt.addEventListener('blur', function(){
		nameOnBlur = blocName;
		objectOnBlur = treeBloc;
	    });
	}
	
	for(var index in listBloc){
	    update(index,listBloc[index]);
	}


	// affichage des blocs du contenu 	
	function aff(bloc){
	    var elt = document.getElementById(bloc),
		command = document.getElementById('ad'+bloc),
		display = document.getElementsByName(bloc)[0].value != '';
	    elt.style.display = (document.getElementsByName(bloc)[0].value == '')? 'none': 'block';
	    command.addEventListener('click', function(){
		elt.style.display = (display)? 'none' : 'block';
		display = !display;
		deleteFromTree(bloc);
	    });
	}
	
	function deleteFromTree(bloc){
	    var value =  document.getElementsByName(bloc)[0].value,
		index = listBloc.indexOf(bloc);
	    currentContent.tree.children[index] = 
		(typeof currentContent.tree.children[index]!= 'undefined')? undefined: value;	
	}

	for(var bloc in addBloc){
	    aff(addBloc[bloc]);
	}

	// affichage des fils
	socket.emit('listOfMath');
	socket.on('listOfMath', function(listOfMath){
	    var childSelect = document.getElementById('child'),
	    list_namestoload = document.getElementById('list_namestoload');
	    for(var i=0; i<listOfMath.length; i++){
		var option = document.createElement('option');
		option.innerHTML = listOfMath[i].title;
		option.value = listOfMath[i].name;
		elt.appendChild(option);
		//list_nametoload.appendChild(option);
	    }
	});

	/*
	 * Socket IO
	 */    
	
	//rendu instantané

	//window.onbeforeunload

	function send(content){console.log(content);
	    socket.emit('refreshMath', content);
	}

	socket.on('refreshMath',function(output){
	    document.getElementById('eltmath').innerHTML = output;
	});

    }); 
}
