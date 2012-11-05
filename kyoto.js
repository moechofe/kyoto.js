"use strict";

/**
 * Implementation of the KyotoTycoon RPC protocol.
 */

// tcpdump -qni lo -s 0 -A port 1978

var
http = require('http'),
querystring = require('querystring'),
agent = new http.Agent({maxSockets:1});

// {{{ response

function response(res, cb)
{
	switch(res.statusCode)
	{
	case 200:
		var params = {};
		var arbitary = {};

		var s = '\t', d = {'\t':'', '\n':''} // search, data( key, value )
		switch(res.headers['content-type'])
		{
		case 'text/tab-separated-values':
			res.on('data', function(chunk){
				var buf = chunk.toString(), o = 0;
				while( o < buf.length )
				{
					var i = buf.indexOf(s,o); // looking for a char (\t or \n alternatively)
					if( ~i ) // if the char is founded
					{
						d[s] += buf.substring(o,i); // copy the string from the current offset to the founded char
						if( s == '\t' ) s = '\n'; // next, looking for a \n
						else {
							s = '\t'; // next, looking for a \t
							if(d['\t'][0]=='_') arbitary[d['\t'].substr(1)] = d['\n'];
							else params[d['\t']] = d['\n']; // add a parameters in the list
							d['\t'] = ''; d['\n'] = ''; // clear the key and the value
						}
						o = i+=1; // increase the offset with the index of the founded char
					}
					else
					{
						d[s] += buf; // append data to the currend key or value
						o = buf.length;
					}
				}
			});
			break;
		default: throw new Error("Content-type not implemented");
		}
		res.on('end', function(){ cb(null, params, arbitary); });
		break;
	case 400: cb(new Error("The format of the request was invalid or the arguments are short for the called procedure.")); break;
	case 450: cb(new Error("The procedure was done but the result did not fulfill the application logic.")); break;
	case 500: cb(new Error("The procedure was aborted by fatal error of the server program or the environment.")); break;
	case 501: cb(new Error("The specified procedure is not implemented.")); break;
	case 503: cb(new Error("The procedure was not done within the given time so aborted.")); break;
	default: throw new Error("Not supported HTTP status code.");
	}
};

// }}}
// {{{ request

function request(host, port, method, path, params, options, arbitrary, cb)
{
	var extend = function(buf, len, need)
	{
		var siz = 2048;	while( need > siz ) siz += 2048;
		var neo = new Buffer(buf.length + siz);
		buf.copy(neo, 0, 0, len);
		return neo;
	};

	var type = 'text/tab-separated-values';

	var len = 0;
	var buf = new Buffer(2048);

	if(params !== null) for(var p in params)
	{
		var k = querystring.escape(p) + '\t';
		var v = querystring.escape(params[p]) + '\n';
		if( len + k.length + v.length > buf.length ) buf = extend(buf, len, k.length + v.length);
		len += buf.write(k,len);
		len += buf.write(v,len);
	}
	if(arbitrary !== null) for(var a in arbitrary)
	{
		var k = '_' + querystring.escape(a) + '\t';
		var v = querystring.escape(arbitrary[a]) + '\n';
		if( len + k.length + v.length > buf.length ) buf = extend(buf, len, k.length + v.length);
		len += buf.write(k,len);
		len += buf.write(v,len);
	}
	if(options !== null) for(var o in options) if(options[o] !== null)
	{
		var k = querystring.escape(o) + '\t';
		var v = querystring.escape(options[o]) + '\n';
		if( len + k.length + v.length > buf.length ) buf = extend(buf, len, k.length + v.length);
		len += buf.write(k,len);
		len += buf.write(v,len);
	}

	var req = http.request({
		agent: agent,
		hostname: host,
		port: port,
		method: method,
		path: path,
		headers: {
			Connection:'keep-alive',
			'Content-type': type,
			'Content-length': len} })
	.on('response', function(res){response(res,cb);});

	req.end(buf.toString('utf8',0,len));
}

// }}}

// {{{ Kyoto

var Kyoto = function Kyoto(port, host)
{
	this.port = port || 1978;
	this.host = host || 'localhost';
}

// }}}
// {{{ rpc

Kyoto.prototype.rpc = function(cmd, params, opts, arbitrary, cb) {
	request(this.host, this.port, 'POST', '/rpc/'+cmd, params, opts, arbitrary, cb);
	return this;
}

// }}}

// {{{ API

var API = function API(port, host, db)
{
	this.kyoto = new Kyoto(port, host);
	this.opts = {
		DB: db,
		CUR: null,
		WAITER: null,
		WAITTIME: null,
		SIGNAL: null,
		SIGNALBROAD: null,
		SIGNALED: null };
};

// }}}
// {{{ cleanOpts, DB, useOpts, sendKeyValueXt, sendKeyNumOrigXt

API.prototype.cleanOpts = function()
{
	this.opts.CUR =
	this.opts.WAITER =
	this.opts.WAITTIME =
	this.opts.SIGNAL =
	this.opts.SIGNALBROAD =
	this.opts.SIGNALED =
	null;
};

API.prototype.DB = function(db){ this.opts.DB = db; return this; };

API.prototype.useOpts = function(){ var opts = this.opts; this.cleanOpts(); return opts; };

API.prototype.sendKeyValueXt = function(cmd, key, val, xt, cb)
{
	var args = {key: key, value: val};
	if(typeof xt == 'function') cb = xt;
	else args['xt'] = xt;
	this.kyoto.rpc(cmd, args, this.useOpts(), null, cb);
};

API.prototype.sendKeyNumOrigXt = function(cmd, key, num, orig, xt, cb)
{
	var args = {key: key, num: num};
	if(typeof orig == 'function') cb = orig;
	else if(typeof xt == 'function') { cb = xt; args['xt'] = orig; }
	else { args['xt'] = xt; args['orig'] = orig; }
	this.kyoto.rpc(cmd, args, this.useOpts(), null, cb);
};

API.prototype.receiveKeyXt = function(cb, err, res)
{
	if(err) return cb(err);
	cb(null, res.value, res.xt||null);
};

API.prototype.receiveVoid = function(cb, err)
{
	if(err) return cb(err);
	cb(null);
};

// }}}
// {{{ --commands

API.prototype.add = function(k,v,x,cb){
	this.sendKeyValueXt.call(this, 'add', k, v, x, null, this.receiveVoid.bind(this,cb)); };

API.prototype.append = function(k,v,x,cb){this.sendKeyValueXt.call(this,'append',k,v,x,null,cb);};

API.prototype.cas = function(k,o,n,x,cb){
	var args = {key: k};
	if(typeof o == 'function') cb = o;
	else if(typeof n == 'function') { cb = n; args['oval'] = o; }
	else if(typeof x == 'function') { cb = x; args['oval'] = o; args['nval'] = n; }
	else { args['oval'] = o; args['nval'] = n; args['xt'] = x; }
	this.kyoto.rpc('cas', args, this.useOpts(), null, cb); };

API.prototype.clear = function(cb){
	this.kyoto.rpc('clear', null, this.useOpts(), null, cb); };

API.prototype.echo = function(o,cb){
	this.kyoto.rpc('echo', o, null, null, cb); };

API.prototype.get = function(k,cb){
	this.kyoto.rpc('get', {key:k}, this.useOpts(), null, this.receiveKeyXt.bind(this,cb)); };

API.prototype.increment = function(k,n,o,x,cb){
	this.sendKeyNumOrigXt('increment', k, n, o, x, cb); };

API.prototype.increment_double = function(k,n,o,x,cb){
	this.sendKeyNumOrigXt('increment_double', k, n, o, x, cb); };

API.prototype.remove = function(k,cb){
	this.kyoto.rpc('remove', {key:k}, this.useOpts(), null, cb); };

API.prototype.replace = function(k,v,x,cb){
	this.sendKeyValueXt('replace', k, v, x, null, cb); };

API.prototype.report = function(cb){
	this.kyoto.rpc('report', null, null, null, cb); };

API.prototype.set = function(k,v,x,cb){
	this.sendKeyValueXt.call(this, 'set', k, v, x, cb); };

API.prototype.void = function(cb){
	this.kyoto.rpc('void', null, null, null, this.receiveVoid.bind(this,cb)); };

API.prototype.play_script = function(n,a,cb){
	this.kyoto.rpc('play_script', {name:n}, null, a, function(e,r,a){
		cb(e,a); }); };

API.prototype.seize = function(k,cb){
	this.kyoto.rpc('seize', {key:k}, this.useOpts(), null, this.receiveKeyXt.bind(this,cb)); };

API.prototype.status = function(cb){
	this.kyoto.rpc('status', null, this.useOpts(), null, cb); };

API.prototype.synchronize = function(o,cb){
	this.kyoto.rpc('synchronize', o, this.useOpts(), null, cb); }

API.prototype.tune_replication = function(o,cb){
	this.kyoto.rpc('tune_replication', o, null, null, cb);};

// }}}

module.exports = {
	Kyoto: Kyoto,
	API: API };

