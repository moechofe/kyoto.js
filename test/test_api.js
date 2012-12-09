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

    describe('clear', function(){
        var k = new kyoto.API;
        it('should return void',function(done){
            k.clear(function(err){
                if(err) throw err;
                arguments.should.not.have.property(1);
                done();
            });
        });
    });

    describe('play_script', function(){
      var k = new kyoto.API;
      it('should not throw an error',function(done){
        k.void(function(err){
          if(err) throw err;
          done();
        });
      });
    });

    describe('report', function(){
       var k = new kyoto.API;
       it('should return an object',function(done){
         k.report(function(err){
           if(err) throw err;
           arguments[1].should.be.a('object');
           done();
         });
       });
    });

    describe('status',function(){
        var k = new kyoto.API;
        it('should return count and size',function(done){
          k.status(function(err){
            if(err) throw err;
            arguments[1].should.be.a('string');
            arguments[2].should.be.a('string');
            if(arguments.hasOwnProperty(3)) arguments[3].should.be.a('object');
            done();
          });
        });
    });
/*
    describe('tune_replication',function(){
      var k = new kyoto.API;
      it('should return void',function(done){
        k.tune_replication({},function(err){
          if(err) throw err;
          arguments.should.not.have.property(1);
          done();
        });
      });
    });
*/
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
