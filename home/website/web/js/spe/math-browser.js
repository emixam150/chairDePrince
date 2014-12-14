window.onload = function(){
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
	
	this.rootsFilter = function(){
	    var newRes = {};
	    if(ctrl.roots.length>0)
		ctrl.chooseRoots(ctrl.roots[ctrl.roots.length -1],newRes)
	    else
		newRes = ctrl.res
	    
	    graph.killLayout();
	    ctrl.updateList(newRes);
	    graph.update(newRes);
	}

	var rootsForm = document.getElementById('roots');

	rootsForm.onchange= function(e){
	    console.log(e.target.parentElement);
	    var name = e.target.parentNode.getAttribute('data-name');
	    if(ctrl.roots.indexOf(name) == -1){
		ctrl.roots.push(name)
	    }else{
		ctrl.roots.splice(ctrl.roots.indexOf(name),1)
	    }
	    ctrl.rootsFilter();
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
    }
    


    var Graph = function(){
	var graph = this;
	this.graphLoaded = false
	this.graphData = {}
	this.chrono = null;

	var s = new sigma('sigma-container');

	this.update = function(data){
	    var dataGraph = builtGraphData(data);

	    // ajout d'events for redirection
	    s.bind('clickNode rightClickNode', function(e) {
		window.location.assign('/math/'+e.data.node.id);
	    });
	    s.bind('overNode', function(e){

	    })

	    // update content of the graph 
	    s.graph.clear();
	    s.graph.read(dataGraph);
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
	
    }

    var ctrl = new Ctrl();
    ctrl.init();

    function builtGraphData(data){
	var dataGraph = {nodes:[], edges:[]}
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
		    })
	    })
	})
	return dataGraph;
    }

} // end of onloadFunction



