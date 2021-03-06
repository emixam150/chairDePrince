/*
 * Lead In Model 
 */
var MongoSession = require(__dirname +'/mongoSession.js');

module.exports = function LeadIn() {
    
    MongoSession.call(this, "leadIn", "main");
    
    var lead = this;

    this.content = '';
    this.bornDate =  new Date();
    this.lastUpdate =  new Date();
    this.random = 0;
    this.sections = [];

    // on ajout une publication à la base de donnée
    this.addThis = function(content,cb){ 
	lead.random = Math.random();
	lead.content = content;
	lead.add(lead, function(){
	    cb(null,lead);
	})
    };

    this.sectionsChange = function(section,cb){
	if(lead._id){
	    if(lead.sections.indexOf(section) != -1)
		lead.sections.splice(lead.sections.indexOf(section),1);
	    else
		lead.sections.push(section)
	    lead.lastUpdate = new Date();
	    lead.update({_id: lead._id},lead, function(result){
		if(result != 0)
		    if(typeof cb != 'undefined'){ 
			cb(null,lead);
		    }else
			if(typeof cb != 'undefined')
			    cb(new Error('no result for update'));
	    })
	}
    }
    
    //met à jour le contenu de la publication suivant l'id sans vérification du contenu
    this.updateThis = function(content,cb){
	if(lead._id){
	    lead.content = content;
	    lead.lastUpdate = new Date();
	    lead.update({_id: lead._id},lead, function(result){
		if(result != 0)
		    if(typeof cb != 'undefined'){ 
			cb(null,lead);
		    }else
			if(typeof cb != 'undefined')
			    cb(new Error('no result for update'));
	    })
	}
    }

    this.removeThis = function(){ this.remove({_id :this._id}); };

    this.set = function(elt){
	lead.random = elt.random;
	lead.bornDate = elt.bornDate;
	lead.lastUpdate = elt.lastUpdate;
	lead.content = elt.content;
	lead.random = elt.random;
	lead.sections = (elt.sections)? elt.sections : [];
	lead._id = elt._id

    }

    this.get = function(id,cb){
	var query = { _id: new lead.ObjectId(id)};
	this.find(query ,function(docs){
	    if(docs.length == 1){
		lead.set(docs[0])
		cb(null);
	    }else
		if(docs.length == 0)
		    cb(new Error('no elt with this id'))
	    else
		cb(new Error('several elts with this id!!'))
	});
    };

    this.getRandom = function(section,cb){
//	console.log("lead",section);
    	var rand = Math.random(),
    	    query = {random: {$gte: rand}, sections: section},
    	    query2 = {random: {$lte: rand}, sections: section};
    	lead.findPlus(query,{},{random:1},1 ,function(docs){
    	    if(docs.length !=0){
    		lead.set(docs[0])
    		cb(null);
    	    }else
    		lead.findPlus(query2,{},{random:1},1 ,function(docs2){
		    if(docs2.length !=0){
    			lead.set(docs2[0])
    			cb(null)
		    }else{
			lead.content = "Bienvenue ici chère voyageur internaute"
			cb(null);
		    }
    		})
    	})
    }

}    //end of model
