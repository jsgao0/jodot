var fs = require('fs');
var path = require('path');
var Hjson = require('hjson');
var process = require('./lib/process.js');
var load = require('./lib/load.js');

var Jodot = function () {};

Jodot.prototype.start = function(dutyFile) {
  return new Promise(function (resolve, reject) {
    fs.readFile(dutyFile, 'utf8', function(err, content) {
      if(err) {
        reject(err);
      } else {
        // Parse as JSON object.
        var duties = Hjson.rt.parse(content)
        var committed = duties.map(function(dutyDef) {
          return new Promise(function(resolve, reject) {
            // Every duty will be set in a single Promise.
  	        load(dutyDef, resolve, reject);
          })
          .then(function(result) {
            // Pass the duty as a parameter to 'process' function.
            process(result);
          })
          .catch(function(error) {
            console.log('Error starting duty: '+error);
          })
        });
        // Resolve all promises.
        Promise.all(committed).then(function() {resolve()});
      }
    });
  });
};

module.exports = new Jodot();
