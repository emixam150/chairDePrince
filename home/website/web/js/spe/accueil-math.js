window.onload = function(){

    var Graph = function(){
	var g = this;
	this.graphLoaded = false;
	this.chrono = null;


	var s = new sigma({container:'sigma-container',settings:{animationsTime: 1000}});


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
	    },300*s.graph.nodes().length);
	}

	this.killLayout = function(){
	    if(this.chrono != null)
		clearTimeout(this.chrono)
	    s.killForceAtlas2();
	}

	this.updateGraph= function(data){
	    s.graph.clear();
	    console.log(data);
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
	    console.log(dataGraph);
	    s.graph.read(dataGraph);
	};
    };

	var socket = io.connect();
	var graph = new Graph();

    socket.emit('reqMB', {types: ['def','th','prop','cor','axiom','lem','conj'],size: 30, order: -1});
   	    
    socket.on('resMB', function(res){
	graph.update(res);
    })
}



