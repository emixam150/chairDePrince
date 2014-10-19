window.onload =function() {

    var socket =  io.connect();
	// window.onbeforeunload = function(){socket.emit('endMath',null); return "wait";};
	// window.onunload=function(){
	//     socket.emit('endMath',null);
	// };
 
    /*
     * Accueil 
     */

    var currentContent = null;

    var ouvrir_button = document.getElementById('ouvrir_button'),
        nametoload = document.getElementById('nametoload'),
        list_namestoload = document.getElementById('list_namestoload'),
        nouveau_button = document.getElementById('nouveau_button');

	function requireListOfMath(){
	    setTimeout(function(){
		socket.emit('listOfMath');
	    },1000)
	}
    
    socket.emit('math', currentContent);

    socket.on('mathLoading', function(){
	socket.emit('listOfMath');
	console.log('mathConnected');

	nouveau_button.addEventListener('click', function(){
	    var title = prompt('Titre:','');
	    if(title && title != '')
		socket.emit('newTitleMath',title); 
	});

	ouvrir_button.addEventListener('click',function(){
	    if(nametoload.value != '')
		socket.emit('loadNameMath',nametoload.value);
	})
    })

    socket.on('listOfMath', function(listOfMath){
	//mise en place des noms des elts 
	list_namestoload.innerHTML ="";
	for(var i=0; i< listOfMath.length; i++){
	    var option = document.createElement('option');
	    option.innerHTML = listOfMath[i].title;
	    option.value = listOfMath[i].name;
	    list_namestoload.appendChild(option);}
    });
    
    socket.on('mathWarning',function(warning){
	alert(warning);
    });

    /*
     * Affichage et MAJ
     */

    var MathEltContent = function(content){
	this.title = content.title;
	this.type = undefined;
	this.parents = [];
	this.children = [];
	this.cases = {
	    "cont": {
		"id": "cont",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    },
	    "dem": { 
		"id": "dem",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    },
	    "rem": {
		"id": "rem",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    },
	    "ex": {
		"id": "ex",
	      "type": "part",
	      "content":"",
	      "children":[],
	      "queries":{}
	    },
	    "exo": {
		"id": "exo",
		"type": "part",
		"content":"",
		"children":[],
		"queries":{}
	    }
	};
	this.updateContentCase = function(indexCase, contentCase){
	    this.cases[indexCase].content = contentCase;
	};

	this.casesDisplay = {
	    "cont": true,
	    "dem": false,
	    "rem": false,
	    "ex": false,
	    "exo": false
	};
	this.displayHideCase = function(indexCase){
	    this.casesDisplay[indexCase] = !this.casesDisplay[indexCase];
	};

	this.loadContent = function(contentMath){
	    if(typeof contentMath.tree != 'undefined' && content.tree.children){
		for(var i=0;i<contentMath.tree.children.length; i++){
		    this.cases[contentMath.tree.children[i].id].content = contentMath.tree.children[i].content;
		    if(contentMath.tree.children[i].id != 'cont')
			this.casesDisplay[contentMath.tree.children[i].id] = true;
		}
	    }
	    this.type = contentMath.type;
	    this.parents = (typeof contentMath.parents != 'undefined')? contentMath.parents: new Array();
	};

	this.addParent = function(parentName){
	    if(this.parents.indexOf(parentName) == -1){
		this.parents.push(parentName);
		return true;
	    }else{
		return false;
	    }
	}

	this.removeParent = function(parentName){
	    this.parents.splice(this.parents.indexOf(parentName),1);
	}

	this.convertForSend = function(contentMath){
	    var tree = {
     		"id": "section",
     		"type": "part",
     		"content":"",
     		"children":[],
     		"queries":{}
	    };

	    for(var caseName in this.cases){
		if(this.casesDisplay[caseName])
		    tree.children.push(this.cases[caseName])
	    }
	    contentMath.tree = tree;
	    contentMath.type = this.type;
	    contentMath.title = this.title;
	    contentMath.parents = this.parents;
	}
    }

    var eventEditor = false;

    socket.on('newContentMath', function(newContent){
	currentContent = newContent.content;
	bornDate = new Date(newContent.bornDate);
	lastUpdate = new Date(newContent.lastUpdate);
	console.log(newContent);
	
	var mathEditor = new MathEltContent(currentContent);

/*
 * Chargement des events de l'editeur
*/

	//MAJ cases
	Object.keys(mathEditor.cases).forEach(function(caseName){
	    var eltHTMLCase = document.getElementsByName(caseName)[0];

	    eltHTMLCase.onkeyup = function(){
		mathEditor.updateContentCase(caseName, this.value);
		mathEditor.convertForSend(currentContent);send(currentContent);
	    };
	});
	//MAJ titre
	document.getElementById('change_title').onclick=function(){
	    var promptTitle = prompt('Titre:',mathEditor.title);
	    if(promptTitle != '' && promptTitle != null){
		socket.emit('changeTitle', promptTitle);
		document.getElementById('current_title').innerHTML=promptTitle;
		mathEditor.title = promptTitle;
		
		mathEditor.convertForSend(currentContent);send(currentContent);
	    }
	};

	//MAJ type
	document.getElementById('type').onchange=function(){
	    mathEditor.type = (this.value != '')? this.value: undefined;
	    mathEditor.convertForSend(currentContent);send(currentContent);
	};
	//MAJ Display Cases
	Object.keys(mathEditor.cases).forEach(function(caseName){
	    var eltDisplayCase = document.getElementById('ad'+caseName);

	    eltDisplayCase.onclick= function(){
		mathEditor.displayHideCase(caseName);
		updateCasesDisplay();
		mathEditor.convertForSend(currentContent);send(currentContent);
	    };
	});
	//MAJ parents
	
	document.getElementById('add_parent_button').onclick= function(){
	    var selectValue = document.getElementById('parentselector').value;
	    if(mathEditor.addParent(selectValue)){
		var li = document.createElement('li'),
		button = document.createElement('button');
		button.type = "button";
		button.innerHTML = "✘";
		button.onclick = function(){
		    li.parentNode.removeChild(li);
		    mathEditor.removeParent(selectValue);
		    socket.emit('removeParentMath',selectValue);
		    mathEditor.convertForSend(currentContent);send(currentContent);
		}
		li.innerHTML = selectValue;
		li.appendChild(button);
		document.getElementById('list_of_parents').appendChild(li);
		//mathEditor.convertForSend(currentContent);send(currentContent);
		socket.emit('addParentMath',selectValue);
	    }
	};

	//Mise en place des events latex
	
	var textEltOnFocus = {},
	    actionKeyDown = false,
	wordsInfo = {
	    37:{
		value: '\\Leftarrow ',
		cursIndent: 0
	    },
	    38:{
		value: '\\longrightarrow ',
		cursIndent: 0
	    },
	    39:{
		value: '\\Rightarrow ',
		cursIndent: 0
	    },
	    40:{
		value: '\\longleftarrow ',
		cursIndent: 0
	    },
	    49: {
		value: '\\mathscr ',
		cursIndent: 0
	    },
	    50:{
		value: '\\mathbb ',
		cursIndent: 0
	    },
	    51:{
		value: '\\mathrm ',
		cursIndent: 0
	    },
	    56: {
		value: '_{}',
		cursIndent: -1
	    },
	    57: {
		value: '^{}',
		cursIndent: -1
	    },
	    60:{
		value: '\\longmapsto ',
		cursIndent: 0
	    },
	    65: {
		value: '\\begin{array}{ll}\n\n\\end{array}',
		cursIndent: -14
	    },
	    67: {
		value: '\\cap ',
		cursIndent: 0
	    },	    
	    68 :{
		value: '\\in ',
		cursIndent: 0
	    },
	    69: {
		value: '\\exists ',
		cursIndent: 0
	    },
	    70: {
		value: '\\forall ',
		cursIndent: 0
	    },
	    73: {
		value: '$$',
		cursIndent:-1
	    },
	    74: {
		value: '\n$$$$\n',
		cursIndent: -3
	    },
	    83: {
		value: '\\sum ',
		cursIndent: 0
	    },
	    84: {
		value: '\\text{} ',
		cursIndent: -2
	    },
	    85: {
		value: '\\cup ',
		cursIndent: 0
	    },
	    89: {
		value: '\\infty',
		cursIndent: 0
	    }
	};
	var insertWord = function(wordInfo){
	    var positionStart = textEltOnFocus.selectionStart;
	    insertAtCursor(textEltOnFocus, wordInfo.value);
	    textEltOnFocus.selectionStart = positionStart + wordInfo.value.length +wordInfo.cursIndent;
	    textEltOnFocus.selectionEnd = positionStart+ wordInfo.value.length +wordInfo.cursIndent;
	    textEltOnFocus.focus();
	};

	Object.keys(mathEditor.cases).forEach(function(caseName){
	    document.getElementsByName(caseName)[0].onfocus = function(){
		textEltOnFocus = this;
	    }
	});
	
	document.getElementById('inline_latex').onclick = function(){
	    insertWord(wordsInfo[73]);
	}

	document.getElementById('newline_latex').onclick = function(){
	    insertWord(wordsInfo[74]);
	}
	
	document.onkeydown = function(e){
	    if(e.keyCode ==  222 || e.keyCode == 176 || e.keyCode == 192 || e.keyCode == 27 ){ 
		e.preventDefault();
		actionKeyDown = true;
	    }else if(typeof wordsInfo[e.keyCode] != 'undefined' && actionKeyDown){
		insertWord(wordsInfo[e.keyCode]);
		e.preventDefault();
	    }
	}

	document.onkeyup = function(e){
	    if(e.keyCode == 222 || e.keyCode == 176 || e.keyCode == 192 || e.keyCode == 27 )
		actionKeyDown = false;
	}
/*
* Chargement des affichages de l'éditeur
*/

	//MAJ de l'affichage des cases
	function updateCasesDisplay(){
	    Object.keys(mathEditor.cases).forEach(function(caseName){
		var eltHTMLCase = document.getElementById(caseName);
		if(mathEditor.casesDisplay[caseName]){
		    eltHTMLCase.style.display = 'block';
		}else{
		    eltHTMLCase.style.display = 'none'; 
		}
	    });
	}
	

/*
 * Chargement des contenus 
*/

	mathEditor.loadContent(currentContent);
	updateCasesDisplay();
	// contenu des cases
	Object.keys(mathEditor.cases).forEach(function(caseName){
	    document.getElementsByName(caseName)[0].value = mathEditor.cases[caseName].content;
	});
	// contenu du titre
	document.getElementById('current_title').innerHTML = mathEditor.title;
	// contenu des dates
	document.getElementById('born_date').innerHTML = bornDate.toLocaleString("fr-FR", {hour12: false});
	document.getElementById('last_update').innerHTML = lastUpdate.toLocaleString("fr-FR", {hour12: false});
	// contenu du type 
	var typeSelectElt = document.getElementById('type'),
	    indexOfType = 0,
	    optionsTypeList = typeSelectElt.getElementsByTagName('option');
	 for(var i=0; i<optionsTypeList.length; i++){
	     if(optionsTypeList[i].value == mathEditor.type)
	 	indexOfType = i;
	 }
	     typeSelectElt.selectedIndex = indexOfType;

	//contenu des parents

	var parentsUlElt = document.getElementById('list_of_parents');
	parentsUlElt.innerHTML = '';
	mathEditor.parents.forEach(function(parentName){
	    var li = document.createElement('li'),
	    button = document.createElement('button');
	    button.type = "button";
	    button.innerHTML = "✘";
	    button.onclick = function(){
		li.parentNode.removeChild(li);
		mathEditor.removeParent(parentName);
		socket.emit('removeParentMath',parentName);
		mathEditor.convertForSend(currentContent);send(currentContent);
	    }
	    li.innerHTML = parentName;
	    li.appendChild(button);
	    parentsUlElt.appendChild(li);
	});

	
	mathEditor.convertForSend(currentContent); send(currentContent);

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

	/*
	 * Socket IO
	 */    
	
	//rendu instantané

	//window.onbeforeunload

	var isWaitingForLatex = false;

	function send(content){
	    console.log(content.tree,content.type);
	    socket.emit('refreshMath', {tree: content.tree,
					type: content.type});
	}

	socket.on('refreshMath',function(output){
	    document.getElementById('render_math').innerHTML = output;
	    if(!isWaitingForLatex){
		isWaitingForLatex = true;
		setTimeout(function(){
		    MathJax.Hub.Typeset();
		    isWaitingForLatex = false;
		},1000);
	    }
	});

    }); 
}

function clone(obj) {
                // Handle the 3 simple types, and null or undefined             
    if (null == obj || "object" != typeof obj) return obj;

                // Handle Date                                                  
    if (obj instanceof Date) {
	var copy = new Date();
        copy.setTime(obj.getTime());
	return copy;
    }

                // Handle Array                                                 
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

                // Handle Object                                                
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
}