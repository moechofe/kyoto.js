kyoto.js
========

[NodeJS]() native implementation of the [KyotoTycoon]() [RPC protocol]().

It let's you send procedures and receive results from a KyotoTycoon server.

Installation
------------

	npm install kyoto.js

Quick start
-----------

First start a server with a prototype tree database using:

	ktserver

Next, create a *test.js* script:

```js
var k = new require('kyoto.js').API;
k.set('japan', 'tokyo', function(err){
	console.log("Record 'japan' was set");
	k.get('japan', function(err, val){
		console.log("Record 'japan' was retrieved", val);
	});
});
```

Kyoto class
===========

The *Kyoto* class provide a simple access to the RPC protocol.

Kyoto constructor
-----------------

>	*Kyoto* **kt** = new Kyoto( )
>
>	*Kyoto* **kt** = new Kyoto( *numeric* **port** )
>
>	*Kyoto* **kt** = new Kyoto( *numeric* **port**, *string* **host** )

Build a *Kyoto* object but do not connect to the server right.

- **port**:

	The port of the server. Default is: 1978.

- **host**:

	The hostname of the server. Default is "localhost".

- **kt**:

	The *Kyoto* object, ready to received procedures.


Kyoto.rpc method
----------------

> *Kyoto* **kt** = **kt** . rpc( *string* **cmd**, *object* **params**, *object* **options**, *object* **arbitrary**, *function* **cb** )

>

Send an *KyotoTycoon* [RPC procedure]().

- **cmd**:

	The name of the procedure. Example: 'get', 'set', 'play_script'

- **param**:

	The parameters of the procedure. Example: {key: 'foo', value: bar}

-

API class
=========

