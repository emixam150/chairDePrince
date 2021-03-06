window.onload =function() {

    var socket =  io.connect();
 
    /*
     * Accueil 
     */



//    var nouveau_button = document.getElementById('nouveau_button');

var listHTML = document.getElementById('lead-list'),
    bornHTML = document.getElementById('born_date'),
    lastUpdateHTML = document.getElementById('last_update'),
    contentTXT = document.getElementsByName('cont')[0],
    controlHTML = document.getElementById('control'),
    newBUT = controlHTML[0],
    sectionsHTML = document.getElementById('sections');

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
	bornHTML.innerHTML = new Date(elt.bornDate).toLocaleDateString();
	lastUpdateHTML.innerHTML = new Date(elt.lastUpdate).toLocaleDateString();
	contentTXT.value = elt.content;
	adm.current = elt;

	if(elt.sections){
	    for(var i=0;i<sectionsHTML.children.length;i++){
		if(elt.sections.indexOf(sectionsHTML.children[i].value) != -1)
		    sectionsHTML.children[i].checked = true;
		else
		    sectionsHTML.children[i].checked = false;
	    }
	}else
	    for(var i=0;i<sectionsHTML.children.length;i++){
		sectionsHTML.children[i].checked = true;
	    }
    }

    this.update = function(content){
	
    }

    this.get= function(id){
	console.log(id);
	socket.emit('get',id)
    }

    this.init = function(){
	socket.on('list',function(list){
	    adm.refreshList(list);
	})

	socket.on('new',function(elt){
	    adm.load(elt);
	})

	newBUT.onclick = function(){
	    socket.emit('new');
	}
	contentTXT.onkeyup = function(e){
	    console.log(e.target.value);
	    socket.emit('update',e.target.value);
	}

	sectionsHTML.onchange = function(e){
	    console.log(e.target);
	    socket.emit('sectionsChange',{"section": e.target.value, "checked": e.target.cheked});
	}
	
	socket.emit('list');
    }


    }

var admin =  new Admin();
    admin.init();
//     socket.emit('math', currentContent);

//     socket.on('mathLoading', function(){
// 	socket.emit('listOfMath');
// 	console.log('mathConnected');

// 	nouveau_button.addEventListener('click', function(){
// 	    var title = prompt('Titre:','');
// 	    if(title && title != '')
// 		socket.emit('newTitleMath',title); 
// 	});

// 	ouvrir_button.addEventListener('click',function(){
// 	    if(nametoload.value != '')
// 		socket.emit('loadNameMath',nametoload.value);
// 	})
//     })

//     socket.on('listOfMath', function(listOfMath){
// 	//mise en place des noms des elts 
// 	list_namestoload.innerHTML ="";
// 	for(var i=0; i< listOfMath.length; i++){
// 	    var option = document.createElement('option');
// 	    option.innerHTML = listOfMath[i].title;
// 	    option.value = listOfMath[i].name;
// 	    list_namestoload.appendChild(option);}
//     });
    
//     socket.on('warning',function(warning){
// 	alert(warning);
//     });

//     /*
//      * Affichage et MAJ
//      */

//     var Admin = function(){
// 	this.subTreeDisplay = {
// 	    "cont": true,
// 	    "dem": false,
// 	    "rem": false,
// 	    "ex": false,
// 	    "exo": false
// 	};

// 	this.displayHideSubTree = function(indexCase){
// 	    this.casesDisplay[indexCase] = !this.casesDisplay[indexCase];
// 	};

// 	this.changeType = function(type){
// 	    socket.emit('changeType', type)
// 	}
// 	this.changeTitle = function(title){
// 	    socket.emit('changeTitle', title)
// 	}

// 	this.addSubTree = function(sectionKey){
// 	    socket.emit('addSubTree',sectionKey)
// 	}

// 	this.rmSubTree = function(sectionKey){
// 	    socket.emit('rmSubTree',sectionKey)
// 	}
	
// 	this.updateSubTree  = function(sectionKey, newContent){
// 	    socket.emit('updateSubTree',sectionKey, newContent)
// 	}

// 	this.addParent = function(parentName){
// 	    socket.emit('addParent', parentName)
// 	}

// 	this.removeParent = function(parentName){
// 	    socket.emit('removeParent',parentName)
// 	}

//     }

//     var eventEditor = false;

//     socket.on('newContentMath', function(newContent){
// 	currentContent = newContent.content;
// 	bornDate = new Date(newContent.bornDate);
// 	lastUpdate = new Date(newContent.lastUpdate);
// 	parentsList = newContent.parents
// 	console.log(newContent);
	
// 	var mathAdmin = new Admin();

// /*
//  * Chargement des events de l'editeur
// */

// 	//MAJ cases
// 	Object.keys(mathAdmin.subTreeDisplay).forEach(function(sectionKey){
// 	    var eltHTMLSubTree = document.getElementsByName(sectionKey)[0];
// 	    eltHTMLSubTree.onkeyup = function(){
// 		mathAdmin.updateSubTree(sectionKey, this.value);
// 	    };
// 	});

// 	//MAJ titre
// 	document.getElementById('change_title').onclick=function(){
// 	    var promptTitle = prompt('Titre:',currentContent.title);
// 	    if(promptTitle != '' && promptTitle != null){
// 		mathAdmin.changeTitle( promptTitle);
// 	    }
// 	};
// 	socket.on('titleChanged',function(title){
// 	    currentContent.title = title
// 	    document.getElementById('current_title').innerHTML=title
// 	})

// 	//MAJ type
// 	document.getElementById('type').onchange=function(){
// 	    mathAdmin.changeType((this.value != '')? this.value: null)
// 	}
// 	socket.on('typeChanged',function(type){
// 	    currentContent.type = type 
// 	})

// 	//MAJ Display Cases
// 	Object.keys(mathAdmin.subTreeDisplay).forEach(function(sectionKey){
// 	    var eltDisplayCase = document.getElementById('ad'+sectionKey);
// 	    eltDisplayCase.onclick= function(){
// 		if(currentContent.tree.children[sectionKey])
// 		    mathAdmin.rmSubTree(sectionKey)
// 		else
// 		    mathAdmin.addSubTree(sectionKey)
// 	    };
// 	});

// 	socket.on('subTreeAdded',function(sectionKey){
// 	    currentContent.tree.children[sectionKey] = true
// 	    document.getElementById(sectionKey).style.display = 'block'
// 	})
// 	socket.on('subTreeRemoved',function(sectionKey){
// 	    currentContent.tree.children[sectionKey] = false
// 	    document.getElementById(sectionKey).style.display = 'none'
// 	})

// 	//MAJ parents
	
// 	document.getElementById('add_parent_button').onclick= function(){
// 	    var selectValue = document.getElementById('parentselector').value;
// 	    if(parentsList.indexOf(selectValue) == -1){
// 		var li = document.createElement('li'),
// 		button = document.createElement('button');
// 		button.type = "button";
// 		button.innerHTML = "✘";
// 		button.onclick = function(){
// 		    socket.on('parentRemoved',function(parentName){
// 			if(parentName == selectValue){
// 			    var listener = this;
// 			    li.parentNode.removeChild(li);
// 			    socket.removeListener('parentRemoved',listener)
// 			    delete parentsList[parentList.indexOf(parentName)]
// 			}
// 		    })
// 		    mathAdmin.removeParent(selectValue);
// 		}
// 		li.innerHTML = selectValue;
// 		li.appendChild(button);
// 		socket.on('parentAdded',function(parentName){
// 		    if(parentName == selectValue){
// 			document.getElementById('list_of_parents').appendChild(li)
// 			var listener = this
// 			socket.removeListener('parentAdded',listener)
// 			parentsList.push(parentName)
// 		    }
// 		})
// 		mathAdmin.addParent(selectValue)
// 	    }
// 	};

// 	//Mise en place des events latex
	
// 	var textEltOnFocus = {},
// 	    actionKeyDown = false,
// 	wordsInfo = {
// 	    37:{
// 		value: '\\Leftarrow ',
// 		cursIndent: 0
// 	    },
// 	    38:{
// 		value: '\\longrightarrow ',
// 		cursIndent: 0
// 	    },
// 	    39:{
// 		value: '\\Rightarrow ',
// 		cursIndent: 0
// 	    },
// 	    40:{
// 		value: '\\longleftarrow ',
// 		cursIndent: 0
// 	    },
// 	    49: {
// 		value: '\\mathscr ',
// 		cursIndent: 0
// 	    },
// 	    50:{
// 		value: '\\mathbb ',
// 		cursIndent: 0
// 	    },
// 	    51:{
// 		value: '\\mathrm ',
// 		cursIndent: 0
// 	    },
// 	    56: {
// 		value: '_{}',
// 		cursIndent: -1
// 	    },
// 	    57: {
// 		value: '^{}',
// 		cursIndent: -1
// 	    },
// 	    60:{
// 		value: '\\longmapsto ',
// 		cursIndent: 0
// 	    },
// 	    65: {
// 		value: '\\begin{array}{ll}\n\n\\end{array}',
// 		cursIndent: -14
// 	    },
// 	    67: {
// 		value: '\\cap ',
// 		cursIndent: 0
// 	    },	    
// 	    68 :{
// 		value: '\\in ',
// 		cursIndent: 0
// 	    },
// 	    69: {
// 		value: '\\exists ',
// 		cursIndent: 0
// 	    },
// 	    70: {
// 		value: '\\forall ',
// 		cursIndent: 0
// 	    },
// 	    73: {
// 		value: '$$',
// 		cursIndent:-1
// 	    },
// 	    74: {
// 		value: '\n$$$$\n',
// 		cursIndent: -3
// 	    },
// 	    83: {
// 		value: '\\sum ',
// 		cursIndent: 0
// 	    },
// 	    84: {
// 		value: '\\text{} ',
// 		cursIndent: -2
// 	    },
// 	    85: {
// 		value: '\\cup ',
// 		cursIndent: 0
// 	    },
// 	    89: {
// 		value: '\\infty',
// 		cursIndent: 0
// 	    }
// 	};
// 	var insertWord = function(wordInfo){
// 	    var positionStart = textEltOnFocus.selectionStart;
// 	    insertAtCursor(textEltOnFocus, wordInfo.value);
// 	    textEltOnFocus.selectionStart = positionStart + wordInfo.value.length +wordInfo.cursIndent;
// 	    textEltOnFocus.selectionEnd = positionStart+ wordInfo.value.length +wordInfo.cursIndent;
// 	    textEltOnFocus.focus();
// 	};

// 	Object.keys(mathAdmin.subTreeDisplay).forEach(function(sectionKey){
// 	    document.getElementsByName(sectionKey)[0].onfocus = function(){
// 		textEltOnFocus = this;
// 	    }
// 	});
	
// 	document.getElementById('inline_latex').onclick = function(){
// 	    insertWord(wordsInfo[73]);
// 	}

// 	document.getElementById('newline_latex').onclick = function(){
// 	    insertWord(wordsInfo[74]);
// 	}
	
// 	document.onkeydown = function(e){
// 	    if(e.keyCode ==  222 || e.keyCode == 176 || e.keyCode == 192 || e.keyCode == 27 ){ 
// 		e.preventDefault();
// 		actionKeyDown = true;
// 	    }else if(typeof wordsInfo[e.keyCode] != 'undefined' && actionKeyDown){
// 		insertWord(wordsInfo[e.keyCode]);
// 		e.preventDefault();
// 	    }
// 	}

// 	document.onkeyup = function(e){
// 	    if(e.keyCode == 222 || e.keyCode == 176 || e.keyCode == 192 || e.keyCode == 27 )
// 		actionKeyDown = false;
// 	}

// /*
//  * Chargement des contenus 
// */

// 	//chargement l'affichage des subTrees
// 	function loadSubTreesDisplay(content){
// 	    Object.keys(content.tree.children).forEach(function(sectionKey){
// 		var eltHTMLCase = document.getElementById(sectionKey);
// 		    eltHTMLCase.style.display = 'block';
// 	    });
// 	}
	
// 	loadSubTreesDisplay(currentContent);
// 	// contenu des cases
// 	Object.keys(currentContent.tree.children).forEach(function(sectionKey){
// 	    document.getElementsByName(sectionKey)[0].value = currentContent.tree.children[sectionKey].content;
// 	});
// 	// contenu du titre
// 	document.getElementById('current_title').innerHTML = currentContent.title;
// 	// contenu des dates
// 	document.getElementById('born_date').innerHTML = bornDate.toLocaleString("fr-FR", {hour12: false});
// 	document.getElementById('last_update').innerHTML = lastUpdate.toLocaleString("fr-FR", {hour12: false});
// 	// contenu du type 
// 	var typeSelectElt = document.getElementById('type'),
// 	    indexOfType = 0,
// 	    optionsTypeList = typeSelectElt.getElementsByTagName('option');
// 	 for(var i=0; i<optionsTypeList.length; i++){
// 	     if(optionsTypeList[i].value == currentContent.type)
// 	 	indexOfType = i;
// 	 }
// 	     typeSelectElt.selectedIndex = indexOfType;

// 	//contenu des parents

// 	var parentsUlElt = document.getElementById('list_of_parents');
// 	parentsUlElt.innerHTML = '';
// 	parentsList.forEach(function(parentName){
// 	    var li = document.createElement('li'),
// 	    button = document.createElement('button');
// 	    button.type = "button";
// 	    button.innerHTML = "✘";
// 	    button.onclick = function(){
// 		socket.on('parentRemoved',function(parentRm){
// 		    if(parentName == parentRm){
// 			var listener = this;
// 			li.parentNode.removeChild(li);
// 			socket.removeListener('parentRemoved',listener)
// 			delete parentsList[parentsList.indexOf(parentName)]
// 		    }
// 		})
// 		    mathAdmin.removeParent(parentName);
// 	    }
// 	    li.innerHTML = parentName;
// 	    li.appendChild(button);
// 	    document.getElementById('list_of_parents').appendChild(li)
// 	});


//      	// librairies


//      	function insertAtCursor(myField, myValue) {
//      	    //IE support
//      	    if (document.selection) {
//      		myField.focus();
//      		var sel = document.selection.createRange();
//      		sel.text = myValue;
//      	    }
//      	    //MOZILLA and others
//      	    else if (myField.selectionStart || myField.selectionStart == '0') {
//      		var startPos = myField.selectionStart;
//      		var endPos = myField.selectionEnd;
//      		myField.value = myField.value.substring(0, startPos)
//      		    + myValue
//      		    + myField.value.substring(endPos, myField.value.length);
//      	    } else {
//      		myField.value += myValue;
//      	    }
//      	}

	
//     }); 

//     /*
//      * Rendu instantané
//      */
    
//     socket.on('refreshDisplay',function(output){
// 	document.getElementById('render_math').innerHTML = output;
// 	MathJax.Hub.Typeset();
//     });
    
    
}
