var normalize = require('path').normalize;

/*
 ** Define the root directory
 **/ 
$.define(exports,"ROOT",normalize( __dirname + '/../..'));

/*
 ** Project's paths
 **/ 
module.exports = {
     html:        this.ROOT + '/web/html',
     images:      this.ROOT + '/web/images',
     svg:         this.ROOT + '/web/svg',
     js:          this.ROOT + '/web/js',
     css:         this.ROOT + '/web/css',
     config:      this.ROOT + '/app/config',
     crons:       this.ROOT + '/app/crons',
     entities:    this.ROOT + '/app/entities',
     language:    this.ROOT + '/app/language',
     logs:        this.ROOT + '/app/logs',
     test:        this.ROOT + '/app/test',
     controllers: this.ROOT + '/src/controllers',
     models:      this.ROOT + '/src/models'
 };
