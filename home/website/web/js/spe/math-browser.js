window.onload = function(){
    var socket = io.connect();
    


    var Graph = function(){
	var object = this
	this.graphLoaded = false
	this.graphData = {}

	socket.emit('graphMath');
	var s = new sigma('sigma-container');
	
	socket.on('dataGraphMath', function(data){
	    if(!object.graphLoaded){
		object.graphLoaded = true
		object.graphData = data
		object.graphNow = data
	    }
	    console.log(data);
	    update(data)
	})// end of onDataGraphMath

	var update = function(data){
	    // ajout d'events for redirection
	    s.bind('clickNode rightClickNode', function(e) {
		window.location.assign('/math/'+e.data.node.id);
	    });

	    // update content of the graph 
	    s.graph.clear();
	    s.graph.read(data);
	    s.refresh();
	    
	    //gestion of the layout force
	    s.startForceAtlas2();console.log(s.graph);
	    setTimeout(function(){s.killForceAtlas2();},120*s.graph.nodes().length);
	}

	//gestion de la selection du type
	var typeSelector = document.getElementById('type');
	
	typeSelector.onchange = function(){
	    s.killForceAtlas2();
	    socket.emit('graphMath', typeSelector.value);
	}
	
	var listResult = document.getElementById('list-result')
	    

// 	//gestion de parenté commune
// 	this.graphNow = this.graphData

// 	for(var k=0 ;k<listResult.children.length;k++){
// 	    var l =listResult.children[k].getElementsByTagName('input')[0]
// 	    l.checked = false
// 	    l.onchange = function(){
// 		var newData = graphOfChildren("orbite",{edges:[],nodes:[]})
// 		object.graphNow = newData
// 		update(newData)
// 	    }
// 	}
	
// 	var graphOfChildren= function(name,data){
// 	    var end = true,
// 		children = []
// 	    object.graphNow.edges.forEach(function(edge){
// 		if(edge.souce == name){
// 		    console.log(name,edge.source)
// 		    data.edges.push(edge)
// 		    end = false
// 		    children.push(edge.target)
// 		}
// 	    })
// 	    if(end){
// 		data.nodes = object.graphNow.nodes
// //		console.log(data.edges)
// 		return data
		
// 	    }else{
// 		children.forEach(function(child){graphOfChildren(child,data)})
// 	    }
		
		
// 	}
    }

    var graph = new Graph();

} // end of onloadFunction



