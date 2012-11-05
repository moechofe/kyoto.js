var should = require('should');
var kyoto = require('../kyoto.js');

describe('API', function(){

    describe('void', function(){
      var k = new kyoto.API;
      it('should... works',function(done){
        k.void(function(err){
          if(err) throw err;
          done();
        });
      });
    });

});
