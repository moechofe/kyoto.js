var should = require('should');
var kyoto = require('../kyoto.js');

describe('API', function(){

	describe('add', function(){
      var k = new kyoto.API;
      it('should return void',function(done){
        k.void(function(err){
          if(err) throw err;
		  arguments.should.not.have.property(1);
          done();
        });
      });
	});

    describe('void', function(){
      var k = new kyoto.API;
      it('should return void',function(done){
        k.void(function(err){
          if(err) throw err;
		  arguments.should.not.have.property(1);
          done();
        });
      });
    });

});
