window.onload = function(){

    var Graph = function(){
	var g = this;
	this.graphLoaded = false;
	this.chrono = null;

	sigma.classes.graph.addMethod('getNodeById', function(id){
	    return this.nodesIndex[id];
	});

	var s = new sigma({container:'sigma-container',settings:{animationsTime: 1000}});


	this.zoomIn = function(name){
	    var node = s.graph.getNodeById(name);
	    sigma.misc.animation.camera(s.camera,{x: node['read_cam0:x'],y: node['read_cam0:y'],ratio:0.1},{duration:1200});
	}

       	this.zoomOut = function(name){
	    var node = s.graph.getNodeById(name);
	    sigma.misc.animation.camera(s.camera,{x: node['read_cam0:x'],y: node['read_cam0:y'],ratio:0.8},{duration:1200});
	}

	this.update = function(data){
	    this.updateGraph(data);

	    // ajout d'events for redirection
	    s.bind('clickNode rightClickNode', function(e) {
		window.location.assign('/math/'+e.data.node.id);
	    });
	    s.bind('overNode', function(e){

	    })

	    // update display of the graph 
	    s.refresh();
	    
	    //gestion of the layout force
	    s.startForceAtlas2({adjustSizes:true,gravity:4});
	    this.chrono = setTimeout(function(){
		this.chrono = null;
		s.killForceAtlas2();
	    },120*s.graph.nodes().length);
	}

	this.killLayout = function(){
	    if(this.chrono != null)
		clearTimeout(this.chrono)
	    s.killForceAtlas2();
	}

	this.updateGraph= function(data){
	    s.graph.clear();
	    var dataGraph = {nodes:[], edges:[]};
	    Object.keys(data).forEach(function(name){
		dataGraph.nodes.push({
		    id: name,
		    label: data[name].title,
		    x: Math.random(),
		    y: Math.random(),
		    size: data[name].children.length +1,
		    color: data[name].type
		});
		data[name].children.forEach(function(childname){
		    if(data[childname])
			dataGraph.edges.push({
			    id: childname +'-'+ name,
			    source : childname,
			    target: name,
			    size: 1,
			    color: data[name].type
			});
		});
	    });
	    s.graph.read(dataGraph);
	};
    };

    var typesForm = document.getElementById('type'), 
	listResult = document.getElementById('list-result'),
	resultSearch = document.getElementById('result-search');
    var listOfElt = {};

    for(var i=0;i<listResult.children.length;i++){	
	listOfElt[listResult.children[i].getAttribute('data-name')] = listResult.children[i];
    }

    var Ctrl = function(){
	var socket = io.connect();
	var graph = new Graph();
	var ctrl = this;
	this.res = {};
	this.resKey = []
	this.rootsRes ={};
	this.roots = [];
	this.search=[];

	this.init = function(){
	    for(var i=0; i<typesForm.length;i++){
		typesForm[i].checked = true;
	    }
	    
	    ctrl.uncheckList();
	    socket.emit('reqMB', {types: ['def','th','prop','cor','axiom','lem','conj']});
	    
	    socket.on('resMB', function(res){
		ctrl.res = res;
		var newRoots = [];
		for(var i=0;i<ctrl.roots.length;i++){
		    if(ctrl.res[ctrl.roots[i]])
			newRoots.push(ctrl.roots[i])
		}
		
		ctrl.resKey = Object.keys(ctrl.res)

		ctrl.search= [];
		for(var i=0; i<ctrl.resKey.length;i++){	
		    ctrl.search.push(symplify(ctrl.res[ctrl.resKey[i]].title))
		}

		ctrl.roots = newRoots;
		ctrl.rootsFilter();
	    })
	}

	//gestion de la selection du type
	
	this.typeCtrl = function(){
	    graph.killLayout();
	    var typesList =[];
	    for(var i=0; i<typesForm.length;i++){
		if(typesForm[i].checked)
		    typesList.push(typesForm[i].value);
	    }
	    socket.emit('reqMB', {types: typesList });
	}
	typesForm.onchange = this.typeCtrl; 

	//list result

	function symplify(w){    
	    w = w.replace(/[èéêë]/g,"e");
	    w = w.replace(/[àâä]/g,"a");
	    w = w.replace(/[ûüù]/g,"u");
	    w = w.replace(/ç/g,"c");
	    w = w.replace(/[ôö]/g,"o");
	    w = w.replace(/[ïî]/g,"i");
	    w.toLowerCase();
	    return w}
	

	this.searchList = function(word){
	    var w = symplify(word),
		newres = {};
            for(var i=0;i<ctrl.search.length;i++){
		if(ctrl.search[i].search(w) > -1){
		    newres[ctrl.resKey[i]] = ctrl.res[ctrl.resKey[i]]
                }
	    }
	    return newres;
	}
	
	resultSearch.onkeyup = function(e){
	    var newRes = ctrl.searchList(e.target.value)
	    graph.killLayout();
	    ctrl.updateList(newRes);
	    ctrl.uncheckList();
	    graph.update(newRes);
	}
	
	this.updateList = function(res){
	    for(var i=0; i<listResult.children.length; i++){
		if(res[listResult.children[i].getAttribute('data-name')])
		    listResult.children[i].style.display = '';
		else
		    listResult.children[i].style.display = 'none';
	    }
	}

	this.uncheckList = function(){
	    this.roots = [];
	    for(var i=0; i<listResult.children.length; i++){
		listResult.children[i].getElementsByTagName('input')[0].checked = false;
	    }
	}

	//roots 
	
	this.rootsFilter = function(name){
	    var newRes = {};
	    if(ctrl.roots.length>0)
		ctrl.chooseRoots(ctrl.roots[ctrl.roots.length -1],newRes)
	    else
		newRes = ctrl.res
	    
	    graph.killLayout();
	    ctrl.updateList(newRes);
	    graph.update(newRes);
	    setTimeout(function(){if(name)graph.zoomOut(name);},1500);
	}

	var rootsForm = document.getElementById('roots');

	rootsForm.onchange= function(e){
	    var name = e.target.parentNode.parentNode.getAttribute('data-name');
	    if(ctrl.roots.indexOf(name) == -1){
		ctrl.roots.push(name)
	    }else{
		ctrl.roots.splice(ctrl.roots.indexOf(name),1)
	    }
	    ctrl.rootsFilter(name);
	}
	
	this.chooseRoots = function(name,object){
	    for(var i=0; i<ctrl.res[name].children.length; i++){
		if(!object[ctrl.res[name].children[i]] && (typeof ctrl.res[ctrl.res[name].children[i]] != 'undefined')){
		    ctrl.chooseRoots(ctrl.res[name].children[i],object)
		}
	    }
	    
	    object[name] = ctrl.res[name];
	    return object;
	}


	//envenement Zoom sur un element

	var eltZoomList = document.getElementsByClassName('elt-zoom'),
	    sigBox = document.getElementById('sigma-container');

	for(var k = 0; k<eltZoomList.length;k++){
	    eltZoomList[k].getElementsByTagName('button')[0].onclick = function(e){
		graph.zoomIn(e.target.parentNode.parentNode.getAttribute('data-name'));
		window.scrollTo(sigBox.offsetLeft,sigBox.offsetTop);
	    };
	};

    }
    

    var ctrl = new Ctrl();
    ctrl.init();


    // gestion de l'agrandissement de la liste

    var largelistButton = document.getElementById('largelist'),
	tabs = document.getElementsByClassName('tabs')[0],
	height = 1000;

    largelistButton.onclick = function(){
	height+=1000;
	tabs.style.height = height+"px";
    }


} // end of onloadFunction



