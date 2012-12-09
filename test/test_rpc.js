var should = require('should');
var kyoto = require('../kyoto.js');

describe('Kyoto.rpc', function(){
  var k = new kyoto.Kyoto;
  it('You should type "ktserver" in a terminal',function(done){
    k.rpc('void', null, null, null, function(err){
      if(err) throw err;
      done();
    });
  });
});
