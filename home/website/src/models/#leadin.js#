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

    // on ajout une publication à la base de donnée
    this.addThis = function(content,cb){ 
	lead.random = Math.random();
	lead.content = content;
	lead.add(lead, function(){
	    cb(null,lead);
	})
    };
    
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
	lead._id = elt._id
//	cb(null);
    }

    this.get = function(id,cb){
	var query = { _id: new lead.ObjectId(id)};
	this.find(query ,function(docs){
	    if(docs.length == 1){
		lead.set(docs[0])
		// lead.random = docs[0].random;
		// lead.bornDate = docs[0].bornDate;
		// lead.lastUpdate = docs[0].lastUpdate;
		// lead.content = docs[0].content;
		// lead._id = docs[0]._id
		cb(null);
	    }else
		if(docs.length == 0)
		    cb(new Error('no elt with this id'))
	    else
		cb(new Error('several elts with this id!!'))
	});
    };

    this.getRandom = function(cb){
	var rand = Math.random(),
	    query = {random: {$gte: rand}},
	    query2 = {random: {$lte: rand}};
	lead.findPlus(query,{},{random:1},1 ,function(docs){
	    if(docs.length !=0){
		console.log(docs[0].random,'>',rand)
		lead.set(docs[0])
		cb(null);
	    }else
		lead.findPlus(query2,{},{random:1},1 ,function(docs2){
		    console.log(docs2[0].random,'<',rand)
		    lead.set(docs2[0])
		    cb(null)
		})
	})
    }

}    //end of model
