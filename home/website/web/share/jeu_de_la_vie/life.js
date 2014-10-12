window.onload = function() {

//**************************Plateau*****************************************************
function Plateau() {
    /* La file data est un tableau de couple trie par ordre alpha entre deux executions de next
    * pendant l'execution de next c'est un tableau de triplet
    */
    this.data = [];
    this.nombre = 0;
    this.generation = 0;

    this.empty = function() {
	this.data = [];
	this.nombre = 0;
	this.generation = 0;
    }

    this.setReduced = function(tab) {
	while(typeof tab[0] !== 'undefined'){
		var x = parseInt(tab.shift()) ;
		var taby = tab.shift();

		while(typeof taby[0] !== 'undefined'){
		    var y = parseInt(taby.shift());
		    this.addORremove(x,y);
		}
	    }
    }
   this.getReduced = function(a,b){
       //rend le tableau reduit avec prise en compte d'un decallage a,b
       var red = [],
       i = 0;
       while(typeof this.data[i] !== 'undefined'){
	   var x = this.data[i][0];
	   red.push(x - a);
	   var taby = [this.data[i][1] - b];
	   i++;
	   while(typeof this.data[i] !== 'undefined' && this.data[i][0] == x){
	       taby.push(this.data[i][1] - b);
	       i++;
	   }
	   red.push(taby);
       }
       return red;
   } 
    this.addORremove = function (x,y) { 
        /* ajout ou supprime les coordonnes du point de data 
        * suivant qu'il existe ou pas
        */
        x = parseInt(x);
        y = parseInt(y);
        var i = 0,
            t = this.data.length; 
        while( i < t && this.data[i][0] <= x && (this.data[i][0] != x || this.data[i][1] < y)){i++;}
        
        if(i < t){  
            if(this.data[i][0] == x && this.data[i][1] == y){
                //supprime le ieme elts
                this.data.splice(i,1);
		this.nombre--;
            } else {
                // on ajoute les coord à la bonne place
                this.data.splice(i,0,[x,y]);
		this.nombre++;
            }
        } else {
            // on ajoute l'elt
            this.data.push([x,y]);
	    this.nombre++;
        }
        return this;
    }    
   
    this.next = function () { 
        
        // on commence par inserer le code pour les voisins de chaque point
        
        while(this.data[0] && !( "2" in this.data[0])) {
            var tmp = this.data.shift(),x = tmp[0],y = tmp[1];
        this.data.push([x,y,9]);
        this.data.push([x-1,y-1,1]);
        this.data.push([x-1,y,1]);
        this.data.push([x-1,y+1,1]);
        this.data.push([x,y-1,1]);
        this.data.push([x,y+1,1]);
        this.data.push([x+1,y-1,1]);
        this.data.push([x+1,y,1]);
        this.data.push([x+1,y+1,1]);
        }
            // on trie par ordre alpha par rapport aux coord
        
       this.data.sort(function(a,b) { // ordre alphabetique sur les deux premier elements de a et b
            if(a[0] != b[0]) {
                return a[0] - b[0];
            } else {
                return a[1] - b[1];
            }
        });
        
       //puis on crée la file suivante
            
       while(this.data[0] && ("2" in this.data[0]) ) {
           
           var tmp = this.data.shift(), x = tmp[0], y = tmp[1], v = tmp[2];
           
           while(this.data[0] && x == this.data[0][0] && y==this.data[0][1]) {
               var n = this.data.shift();
               v += n[2]; // somme les valeurs de v pour les memes coord
           }
           //on en déduit le nombre de voisins
           if(v == 3 || v == 11 || v == 12) {
              this.data.push([x,y]); 
           }
       } 
	this.nombre = this.data.length;
	this.generation++;
    }   
}



//*************************************Canvas********************************************


function Canvas(canvas, r){
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.rayon = r;
    this.drag = false;
    this.wasdrag = false;
    this.mode = false; // signifie que le jeu n'est pas en marche
    this.origine = [0,0]; // position du cote haut gauche de l'affichage variable suivant le rayon sur le plan infini
    
    this.zoom = function(d,x,y) { 
	//zoom ou dezoom en laissant x,y à la meme position
	if((this.rayon<10 && this.rayon >1) || (this.rayon >= 10 && d<0) || (this.rayon<=1 && d>0)){
	    this.origine[0] = ((this.rayon + d/2)/this.rayon)*(this.origine[0] + x) - x;
	    this.origine[1] = ((this.rayon + d/2 ) /this.rayon)*(this.origine[1] + y) - y;
	    if(d > 0) { this.rayon += 0.5 }
	    else {this.rayon -= 0.5 }
	}
    }

    this.getWidth = function() {
        return this.canvas.width;
    }
    this.setWidth = function(w) {
        this.canvas.width = w;
    }
        this.getHeight = function() {
        return this.canvas.height;
    }
    this.setHeight = function(h) {
        this.canvas.height = h;
    }

    this.draw = function(p) {
        
        // on nettoie le canevas
        this.context.clearRect(0,0,this.getWidth(),this.getHeight()); 

	for(i=0;i < p.data.length; i++) {


            if(2*this.rayon*(p.data[i][0]+1) > this.origine[0]  && 
               2*this.rayon*p.data[i][0] < this.origine[0] + this.getWidth() &&
               2*this.rayon*(p.data[i][1]+1) > this.origine[1] && 
               2*this.rayon*p.data[i][1] < this.origine[1] + this.getHeight() ) {

		       this.context.beginPath();
		       this.context.arc(this.rayon*(2*p.data[i][0]+1) - this.origine[0],
					this.rayon*(2*p.data[i][1]+1) - this.origine[1],
					this.rayon,0,2*Math.PI);
		       this.context.fillStyle = "#E1170D";
		       this.context.fill();
		       this.context.closePath();
            }
        }
	    
	if(!this.mode && this.rayon > 3){
	    //on cherche les premieres coord 

	    var x =  - (this.origine[0] %(2*this.rayon)),
	    y =  - (this.origine[1] %(2*this.rayon));
	    
	    while(x < this.getWidth())
		{
 		this.context.beginPath();
		this.context.moveTo(x,0);
		this.context.lineTo(x,this.getHeight());
		this.context.strokeStyle='#A2967D';
		this.context.stroke();
		this.context.closePath();
		    x+= 2*this.rayon;
		}
	     while(y < this.getHeight())
		{
 		this.context.beginPath();
		this.context.moveTo(0,y);
		this.context.lineTo(this.getWidth(),y);
		this.context.strokeStyle='#A2967D';
		this.context.stroke();
		this.context.closePath();
		    y+= 2*this.rayon;
		}
	    
	}
    }
}

 
//*****************************Animation**************************************************

    function Animation(v,a) {
    this.vitesse = v;
    this.interval = undefined;

    this.run = function(){
	this.interval = setInterval(action,1000/this.vitesse);
    }
    this.pause = function() {
	clearInterval(this.interval);
    }
    this.stop = function() {
	clearInterval(this.interval);
    }
}
//**************************************init*********************************************
var plateau = new Plateau();

var canvas = new Canvas(document.getElementById('mon_canvas'),8);
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight-40);
canvas.draw(plateau);

var gen = document.getElementById('generation');
var nombre = document.getElementById('nombre');

var vitesse = 4;
function action() {
    plateau.next();
    canvas.draw(plateau);
    nombre.innerHTML = plateau.nombre;
    gen.innerHTML = plateau.generation;
}
var animation = new Animation(vitesse,action);

//**************************************interface****************************************

//def des inputs
var play_input = document.getElementById('play_input');
var stop_input = document.getElementById('stop_input');
var vitesse_input = document.getElementById('vitesse_input');
var exemple_input = document.getElementById('exemple_input');
var exemple_select = document.getElementById('exemple_select');
var plateau_input = document.getElementById('plateau_input');
var obtenir_input = document.getElementById('obtenir_input');
var afficher_input = document.getElementById('afficher_input');
var my_canvas = document.getElementById('mon_canvas');


//play

play_input.addEventListener('click',
                 function() {
		     if(!canvas.mode){//play
		     stop_input.disabled = false;
		     vitesse_input.disabled = true;
		     
     			 play_input.childNodes[1].innerHTML = "▮▮";
		     
		     canvas.mode = true;
			 animation.run();
		     }else {//pause
			 stop_input.disabled = false;
			 vitesse_input.disabled = false;
			 play_input.childNodes[1].innerHTML = "▶"
			 
			 
			 canvas.mode = false;
			 animation.pause();
			 canvas.draw(plateau);
		     }
			 
			     },true);

//stop

stop_input.addEventListener('click',
                 function() {

		     stop_input.disabled = true;
		     play_input.disabled = false;
		     vitesse_input.disabled = false;
		     
		     canvas.mode = false;
		     animation.stop();
		     plateau.empty();
		     canvas.draw(plateau);
			     },true);
//vitesse
vitesse_input.addEventListener('change',function(){
    animation.vitesse = vitesse_input.value;   //console.log(canvas.vitesse);
                                 },false);

//****************************my_canvas
// gestion de l'event resize
window.addEventListener('resize',function(){
    canvas.setWidth(document.getElementById('canvas').offsetWidth);
    canvas.setHeight(document.getElementById('canvas').offsetHeight)
    canvas.draw(plateau);
                                           },false);

    
// positionnement des cellules

function ajout_cellule(e){
    if(!canvas.mode && !canvas.wasdrag){
        var x = Math.floor((e.clientX-                            my_canvas.getBoundingClientRect().left + canvas.origine[0])/(2*canvas.rayon)),
		y = Math.floor((e.clientY-my_canvas.getBoundingClientRect().top + canvas.origine[1])/(2*canvas.rayon));
        plateau.addORremove(x,y);
		canvas.draw(plateau);
		nombre.innerHTML = plateau.nombre;
    }
    canvas.wasdrag = (canvas.wasdrag)? false : false;
}
    
my_canvas.addEventListener('click',ajout_cellule,false);

// zoom et dezoom
my_canvas.addEventListener('mousewheel',mouseWheel,false);
my_canvas.addEventListener('DOMMouseScroll',mouseWheel,false);

function mouseWheel(e) {
    // sens du scroll
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    var posx = e.clientX-my_canvas.getBoundingClientRect().left;
    var posy = e.clientY-my_canvas.getBoundingClientRect().top;
    canvas.zoom(delta,posx,posy);
    canvas.draw(plateau);
}

//deplacement 
var decompte;
my_canvas.addEventListener('mouseout',function(){
    //si on sort la souris du canvas pendant un déplacement on l'arrete
    canvas.drag = false;
                          },false);
my_canvas.addEventListener('mousedown',function(){
    //on attend 10ms avant de lancer le déplacement
    decompte = setTimeout(function() {canvas.drag = true},100); 
		           },false);

my_canvas.addEventListener('mouseup',function(){
    //si le décompte est encore en route alors qu'on lance la souris on le coupe
    clearTimeout(decompte);
    canvas.drag = false;
    canvas.draw(plateau);
                           }, false);

my_canvas.addEventListener('mousemove', function(e){
    if(canvas.drag){
	
	if(canvas.wasdrag){
	    //signifie que ce n'est pas le premier mouvement ie canvas.drag est un tableau
	    canvas.origine[0] -= e.clientX - canvas.drag[0];
	    canvas.origine[1] -= e.clientY - canvas.drag[1];
	    canvas.wasdrag++;
	    //on trace le plateau 1 fois sur 10  
	    if(!(canvas.wasdrag%10)){canvas.draw(plateau);}
	}else {
	    //on previent que le prochain evenement click et du au deplacement
	    canvas.wasdrag = 1;
	}
	canvas.drag = [e.clientX,e.clientY];
    }
                            },true);

//obtenir le plateau

function StringToArray(str){
    var tab =  str.split('|'),
    k=1;
    while(typeof tab[k] !== 'undefined'){
	tab[k] = tab[k].split(',');
	k += 2;
    }
    return tab;
}

obtenir_input.addEventListener('click',function(){
    var a = Math.floor(canvas.origine[0]/(2*canvas.rayon)),
    b  = Math.floor(canvas.origine[1]/(2*canvas.rayon));
     plateau_input.value = plateau.getReduced(a,b).join('|');
       },false);

afficher_input.addEventListener('click',function(){
    
    var tab = StringToArray(plateau_input.value);

    plateau.empty();
    plateau.setReduced(tab);

    canvas.origine = [0,0];
    canvas.draw(plateau);
    nombre.innerHTML = plateau.nombre;
},false); 
    
//exemples
var exemples = {
    planeur : { 
        value:'13|17|14|15,17|15|16,17',
        name :'planeur'},
    octogone : {        value:'31|19,22|32|18,20,21,23|33|19,22|34|19,22|35|18,20,21,23|36|19,22',
    name :'octogone'},
    horloge : {   value:'9|13,14|10|13,14|12|13,14,15,16|13|12,17,19,20|14|12,14,15,17,19,20|15|9,10,12,13,17|16|9,10,12,17|17|13,14,15,16|19|15,16|20|15,16',
               name :'horloge'},
    pentadecathlon : {       value:'8|14|9|14|10|13,15|11|14|12|14|13|14|14|14|15|13,15|16|14|17|14',
     name :'pentadecathlon'},
    canon : {           value:'11|9,10|12|9,10|21|9,10,11|22|8,12|23|7,13|24|7,13|25|10|26|8,12|27|9,10,11|28|10|31|7,8,9|32|7,8,9|33|6,10|35|5,6,10,11|45|7,8|46|7,8',
    name :'canon'},
    ligne : { value:'0|9|1|9|2|9|3|9|4|9|5|9|6|9|7|9|8|9|9|9|10|9|11|9|12|9|13|9|14|9|15|9|16|9|17|9|18|9|19|9|20|9|21|9|22|9|23|9|24|9|25|9|26|9|27|9|28|9|29|9|30|9|31|9|32|9|33|9|34|9|35|9|36|9|37|9|38|9|39|9|40|9|41|9|42|9|43|9|44|9|45|9|46|9|47|9|48|9|49|9|50|9|51|9|52|9|53|9|54|9|55|9|56|9|57|9|58|9|59|9|60|9|61|9|62|9|63|9|64|9|65|9|66|9|67|9|68|9|69|9|70|9|71|9|72|9|73|9|74|9|75|9|76|9|77|9|78|9|79|9|80|9|81|9|82|9|83|9|84|9|85|9|86|9|87|9|88|9|89|9|90|9|91|9|92|9|93|9|94|9|95|9|96|9|97|9|98|9|99|9|100|9|101|9|102|9|103|9|104|9|105|9|106|9|107|9|108|9|109|9|110|9|111|9|112|9|113|9|114|9|115|9|116|9|117|9|118|9|119|9|120|9|121|9|122|9|123|9|124|9|125|9|126|9|127|9|128|9|129|9|130|9|131|9|132|9|133|9|134|9|135|9|136|9|137|9|138|9|139|9|140|9|141|9|142|9|143|9|144|9|145|9|146|9|147|9|148|9|149|9|150|9|151|9|152|9|153|9|154|9|155|9|156|9|157|9|158|9|159|9|160|9|161|9|162|9|163|9|164|9|165|9|166|9|167|9|168|9|169|9|170|9|171|9|172|9|173|9|174|9|175|9|176|9|177|9|178|9|179|9|180|9|181|9|182|9|183|9|184|9|185|9|186|9|187|9|188|9|189|9|190|9|191|9|192|9|193|9|194|9|195|9|196|9|197|9|198|9|199|9|200|9|201|9|202|9|203|9|204|9|205|9|206|9|207|9|208|9|209|9|210|9|211|9|212|9|213|9|214|9|215|9|216|9|217|9|218|9|219|9',
             name :'ligne'},
    puffeur : {        value:'3|3,7,8,20,21,25|4|4,7,8,20,21,24|5|4,7,21,24|6|4,24|7|4,9,10,12,16,18,19,24|8|1,4,10,11,12,16,17,18,24,27|9|2,3,4,11,17,24,25,26',
               name :'puffeur'},
    emeline : {
value:'17|8,9,13,17,18|18|8,9,12,14,17,18|19|10,13,16|20|13|21|9,13,17|22|8,10,11,12,14,15,16,18|23|9,13,17|24|13|25|10,13,16|26|8,9,12,14,17,18|27|8,9,13,17,18',
        name :'emeline'},
    pulsar : {
        value:'11|11|12|10,11,12|13|10,12|14|10,11,12|15|11',
        name :'pulsar'},
    coverleaf : { value:'17|17,19|18|15,16,17,19,20,21|19|14,18,22|20|14,16,20,22|21|15,16,18,20,21|23|15,16,18,20,21|24|14,16,20,22|25|14,18,22|26|15,16,17,19,20,21|27|17,19',
        name :'coverleaf'},
    tumbler : { value:'10|10,11,12|11|10,14,15|12|11,12,13,14,15|14|11,12,13,14,15|15|10,14,15|16|10,11,12',
        name :'tumbler'},
    queen_bee_shuttle: { value:'12|14,15|13|14,15|18|13,14,15|19|13,14,15|20|12,16|22|11,12,16,17|32|14,15|33|14,15',
        name :'queen bee shuttle'},
    blocker : { value:'2|4,5|3|2,5|5|2,5|6|3,6|7|4,6|8|5|10|4,5|11|4,5',
        name :'blocker'},
    matthias_spaceship : { value:'5|10,11,12,13|6|8,9,14,15|7|8,9,15|8|10,11,13,15|9|15|10|11,15|11|11,16|12|13,14,15,19|13|13,14,19|14|19,20|15|21|16|21,22,23|19|24|20|23,25,26,27,28,29|21|22,23,29|22|22,23,27,30|23|30|24|24,25,27,30|25|27,30|26|28,29|27|28,29',
        name :'Matthia\'s spaceship'},
    oscillatortrenteun : { value:'12|11,12,20,21|13|11,12,20,21|18|11,21|19|10,12,20,22|20|10,13,19,22|21|10,11,12,20,21,22|22|11,21|25|11,21|26|10,11,12,20,21,22|27|10,13,19,22|28|10,12,20,22|29|11,21|34|11,12,20,21|35|11,12,20,21',
        name :'31-oscillateur'},
    croix_gammee : { value:'4|5,6,7|5|7,10|6|7,10|7|4,5,6,7,8,9,10|8|4,7|9|4,7|10|7,8,9',
        name :'croix gammée'},
    carre_constructeur : {
    value: '10|14|12|13,14|14|10,11,12|16|9,10,11|17|10',
        name: 'constructeur minimal de carrés'},
two_way_constructor : {
    value: '4|9|5|9|6|9|7|9|8|9|9|9|10|9|11|9|13|9|14|9|15|9|16|9|17|9|21|9|22|9|23|9|30|9|31|9|32|9|33|9|34|9|35|9|36|9|38|9|39|9|40|9|41|9|42|9',
        name: 'constructeur de carrés dans 2 directions'},
acorn : {
    value: '8|12|9|10,12|11|11|12|12|13|12|14|12',
        name: 'acorn'},
diehard : {
    value: '8|8|9|8,9|13|9|14|7,9|15|9',
    name: 'diehard'}
    
};

    // creation de la lsite des selections
    for(var index in exemples){
        exemple_select.innerHTML += '<option value="'+ index +'">' + exemples[index].name +'</option>';
    }; 
    
    //affichage d'un exemple
exemple_input.addEventListener('click',function(){
    
    var tab_exemple = StringToArray(exemples[exemple_select.value].value);
    plateau.empty();
    plateau.setReduced(tab_exemple);

    canvas.origine = [0,0];
    canvas.draw(plateau);
    nombre.innerHTML = plateau.nombre;
    },false);

/*****************gestion du panneau*************************/
//deplacement des controle sur l'event resize
var panneau = document.getElementById('panneau'),
    place_option = document.getElementById('place_option'),
    place_docs = document.getElementById('place_docs'),
    input_docs = document.getElementById('input_docs'),
    input_opts = document.getElementById('input_opts'),
    input_close = document.getElementById('input_close'),
    option = document.getElementById('option');
// deplacer les options s'il n'y a pas la place
    function deplacer_option() {
    var ctrl = document.getElementById("sec");
        if(window.innerWidth <1000){
            place_option.appendChild(ctrl);
        }else {
            document.getElementById('variable').appendChild(ctrl);
        }
    }
    deplacer_option();
window.addEventListener('resize',deplacer_option,false);

function close_open(){
        panneau.className = (panneau.className == 'hidden')? '' : 'hidden';
    }
    
input_close.addEventListener('click',close_open,false);
option.addEventListener('click',close_open,false);    

function switch_opts(){
        place_docs.className = 'hidden';
        place_option.className = '';
        input_docs.className = 'button';
        input_opts.className = 'button dead';
    }
    
function switch_docs(){
        place_docs.className = '';
        place_option.className = 'hidden';
        input_docs.className = 'button dead';
        input_opts.className = 'button';
    }

input_opts.addEventListener('click', switch_opts,false);
input_docs.addEventListener('click',switch_docs,false);

/***********Random Option*******************************************/    
    var input_coef = document.getElementById('input_coef'),
        input_random = document.getElementById('input_random');
    
    function fill_random(x,y,largeur,hauteur,coef){
        plateau.empty();
        for(var i=0;i<largeur;i++){
            for(var j=0;j<hauteur;j++) {
                if(Math.random() < coef){
                    plateau.addORremove(x+i,y+j);
                }
            }
        }
    canvas.draw(plateau);
    }
    
   input_random.addEventListener('click',function(e){

        var x,y,posx,posy,cpt = 0,
            k = 0,
            coef = input_coef.value;
       
       function draw_rect(event){
                if(cpt%5 == 0){
                    cpt++;
                    
                    canvas.draw(plateau);
                    var posx2 = event.clientX - my_canvas.getBoundingClientRect().left;
                    var posy2 = event.clientY - my_canvas.getBoundingClientRect().top;
                                
                    canvas.context.beginPath();
                    canvas.context.setLineDash([10]);
                    canvas.context.strokeStyle = '#E1170D';
                    canvas.context.rect(Math.min(posx2,posx),Math.min(posy,posy2),Math.abs(posx2 - posx),Math.abs(posy2 - posy));
                    canvas.context.stroke();   
                    canvas.context.closePath();
                    canvas.context.setLineDash([]);
                }else{cpt++;}
       }
       
       my_canvas.removeEventListener('click',ajout_cellule,false);
       
       function choose_rect(e){
           if(k == 0){
              x = Math.floor((e.clientX - my_canvas.getBoundingClientRect().left + canvas.origine[0])/(2*canvas.rayon));
		      y = Math.floor((e.clientY - my_canvas.getBoundingClientRect().top + canvas.origine[1])/(2*canvas.rayon));
               posx = e.clientX - my_canvas.getBoundingClientRect().left;
               posy = e.clientY - my_canvas.getBoundingClientRect().top;
                k++;
               draw_rect(e);
               my_canvas.addEventListener('mousemove',draw_rect,false);
               
           }else{
               my_canvas.removeEventListener('mousemove',draw_rect,false);
                 var x2 = Math.floor((e.clientX - my_canvas.getBoundingClientRect().left + canvas.origine[0])/(2*canvas.rayon)),
		              y2 = Math.floor((e.clientY - my_canvas.getBoundingClientRect().top + canvas.origine[1])/(2*canvas.rayon));
                var largeur = Math.abs(x - x2),
                    hauteur = Math.abs(y - y2);
               x = Math.min(x,x2);
               y = Math.min(y,y2);
               fill_random(x,y,largeur +1,hauteur +1,coef);
               
                my_canvas.removeEventListener('click',choose_rect,false);
                my_canvas.addEventListener('click',ajout_cellule,false);
           }
            
       }
       
       my_canvas.addEventListener('click',choose_rect,false);
   },false);

/********affichage d'un life file******/
    
    var input_filelife = document.getElementById('input_filelife');
    var input_afflife = document.getElementById('input_afflife');
    
    function add_file(){
        
        var tab_lignes = input_filelife.value.split('\n');
        plateau.empty();
        
        for(var i in tab_lignes){
            if(tab_lignes[i][0] != '#'){
            for(var j in tab_lignes[i]){
                if(tab_lignes[i][j] != '.'){
                    plateau.addORremove(j,i);
                }
            }}
        }
        canvas.origine = [-10*canvas.rayon,-10*canvas.rayon];
        canvas.draw(plateau);
    }
    
    input_afflife.addEventListener('click',add_file,false);
}

