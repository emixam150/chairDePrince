/*
 *Math Elt Display
 */
var paths = require($.paths),
commonTreeTemplate = require( paths.models + '/commonTreeTemplate.js'),
tempModel = require(paths.models + '/template.js'),
MathOb = require(paths.models + '/math.js');

exports.exec = function(mathElt, htmlFile, cb) {

    recupParentChild((typeof mathElt.content.parents != 'undefined')? mathElt.content.parents:[],(typeof  mathElt.content.children != 'undefined')? mathElt.content.children: [] , function(parentsDisplay, childrenDisplay){

	//console.log(mathElt.content.tree.children)

	var section ={
	    id: "section",
	    type: "part",
	    children: (typeof mathElt.content.tree != 'undefined')? mathElt.content.tree.children:[],
	    queries: {
		title: mathElt.content.title,
		bornDate: formatDate(mathElt.bornDate),
		type: mathElt.translateTypeName(mathElt.content.type),
		typeColor : mathElt.translateTypeColor(mathElt.content.type),
		parents: parentsDisplay,
		parentsVisibility: parentsDisplay.length !=0,
		children: childrenDisplay,
		childrenVisibility: childrenDisplay.length !=0
	    },
	    content: htmlFile
	};
	cb(section);
    });
};

var formatDate = function(date){
    if(date){
	var month = (date.getMonth()<9)? "0"+(date.getMonth()+1):date.getMonth()+1
	return date.getDate()+"/"+month+"/"+date.getFullYear();
    }else
	return ""
}

var recupParentChild = function(parents, children, cb){
    var cpt = 0,
    parentsDisplay =[],
    childrenDisplay =[];
    
    function next(){
	cpt ++;
	if(cpt == parents.length + children.length)
	    cb(parentsDisplay, childrenDisplay);
    };

    if(parents.length + children.length == 0)
	cb(parentsDisplay, childrenDisplay);

    parents.forEach(function(parentId){
	var MathRecup = new MathOb();
	MathRecup.getById(parentId,function(result){
	    parentsDisplay.push({
		name: MathRecup.name,
		title: (typeof result != 'undefined')? MathRecup.content.title: 'Non trouvé!!!!',
		colorOfType: MathRecup.translateTypeColor(MathRecup.content.type)
	    });
	    next();
	});
    })
    children.forEach(function(childId){
	var MathRecup = new MathOb();
	MathRecup.getById(childId,function(result){
	    childrenDisplay.push({
		name: MathRecup.name,
		title: MathRecup.content.title,
		colorOfType: MathRecup.translateTypeColor(MathRecup.content.type)
	    });
	    next();
	});
    });
}