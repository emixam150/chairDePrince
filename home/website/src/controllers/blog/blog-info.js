var paths = require($.paths),
    Blog = require(paths.models + '/blog.js');

var blogPage = new Blog();

exports.exec = function(nb,cb){

    blogPage.findPlus({},{name:1, published:1},{publishDate: -1}, 100,function(docs){
	console.log("docs",docs);
	publishedOrNot(docs,0,{});		
    })//end of findPlus

    var makeListOfArticle = function(objects,err){
	var cpt = 0,
	    listOfArticle = [];

	Object.keys(objects).forEach(function(article){
	    var date = formatDate(objects[article].publishDate,'H')

	    listOfArticle.push({
		numberOfDay : date.day,
		month: date.month,
		year: date.year,
		titleOfArticle: objects[article].content.title,
		nameOfArticle: objects[article].name,
		advertOfArticle: objects[article].content.advert
	    });
     	    cpt ++
     	    if(cpt == Object.keys(objects).length)
     		cb(listOfArticle,err);
	})
    }

    var publishedOrNot = function(docs,k,objects){

	if(docs[k] && k <nb){
	    console.log(docs[k].name);
	    if(docs[k].published){
		blogPage.getByName(docs[k].name, function(err,result){
		    objects[docs[k].name] = clone(result);
		    publishedOrNot(docs,k+1,objects);
		})
	    }else
		publishedOrNot(docs,k+1,objects);
	}else{
	    //	    console.log("objects",objects);
	    if(Object.keys(objects).length >0)
		makeListOfArticle(objects,false);
	    else
		cb([],true);
	}
    }

}


var formatDate = function(date,dateType){
    var listOfMonth = ["Janvier","Février","Mars","Avril","Mai","Juin","Juil.","Août","Sept.","Nov.","Déc."]
    if(date){
	var month = (date.getMonth()<9)? "0"+(date.getMonth()+1):date.getMonth()+1,
	    monthH = listOfMonth[date.getMonth()],
	    cDay = (date.getDate()<9)? "0"+(date.getDate()+1):date.getDate()+1
	if(dateType == 'H')
	    return {day: cDay,month: monthH, year: date.getFullYear()};
	else if(dateType == 'C')
	    return date.getFullYear()+ '-' +month+ '-' +cDay;
	else
	    return ""
    }else
	return ""
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

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
