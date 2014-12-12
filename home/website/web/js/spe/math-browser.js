window.onload = function(){



    var Ctrl = function(){
	var socket = io.connect();
	var graph = new Graph();
	var typesForm = document.getElementById('type'), listResult = document.getElementById('list-result');
	var ctrl = this;
	this.res = {}

	this.init = function(){
	    //init types
	    for(var i=0; i<typesForm.length;i++){
		typesForm[i].checked = true;
	    }
	    socket.emit('reqMB', {types: ['def','th','prop','cor','axiom','lem','conj'] });
	    
	    socket.on('resMB', function(res){
		ctrl.res = res;
		ctrl.updateList(res)
		graph.update(res)
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

	this.updateList = function(res){
	    for(var i=0; i<listResult.children.length; i++){
		if(res[listResult.children[i].getAttribute('data-name')])
		    listResult.children[i].style.display = '';
		else
		    listResult.children[i].style.display = 'none';
	    }
	}

	//roots 
	
	//this.rootsC
    }
    


    var Graph = function(){
	var graph = this;
	this.graphLoaded = false
	this.graphData = {}


	var s = new sigma('sigma-container');

	this.update = function(data){
	    var dataGraph = builtGraphData(data);

	    // ajout d'events for redirection
	    s.bind('clickNode rightClickNode', function(e) {
		window.location.assign('/math/'+e.data.node.id);
	    });

	    // update content of the graph 
	    s.graph.clear();
	    s.graph.read(dataGraph);
	    s.refresh();
	    
	    //gestion of the layout force
	    s.startForceAtlas2();
	    setTimeout(function(){s.killForceAtlas2();},120*s.graph.nodes().length);
	}

	this.killLayout = function(){
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



