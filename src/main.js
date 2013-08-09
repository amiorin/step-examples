'use strict';

var h = require('hyperquest');
var step = require('step');
var es = require('event-stream');


step(
  function() {
    h.get('/a.json', this);
  },
  function(err, res) {
    h.get('/b.json', this);
    console.log('a: ', res.statusCode);
  },
  function(err, res) {
    h.get('/c.json', this);
    console.log('b: ', res.statusCode);
  },
  function(err, res) {
    console.log('c: ', res.statusCode);
  }
);

step(
  function() {
    h.get('/d.json', this.parallel());
    h.get('/e.json', this.parallel());
    h.get('/f.json', this.parallel());
  },
  function(err, res1, res2, res3) {
    console.log('d: ', res1.statusCode);
    console.log('e: ', res2.statusCode);
    console.log('f: ', res3.statusCode);
  }
);

step(
  function() {
    h.get('/g.json').pipe(es.wait(this.parallel()));
    h.get('/h.json').pipe(es.wait(this.parallel()));
    h.get('/i.json').pipe(es.wait(this.parallel()));
  },
  function() {
    var group = this.group();
    var results =Array.prototype.slice.call(arguments, 1);
    results.forEach(function(body) {
      safeParse(body, group());
    });
  },
  function(err, objects) {
    console.log('objects: ', objects);
  }
);

function safeParse(string, callback) {
  var json;
  try {
    json = JSON.parse(string);
  } catch (err) {
    return callback(err);
  }
  callback(null, json);
}
