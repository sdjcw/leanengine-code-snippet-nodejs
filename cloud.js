var AV = require('leanengine');
var requireFromString = require('require-from-string');

const code = `exports.handler = (request) => {
  retur 'Hello world!';
}`

try {
  const m = requireFromString(code)
  AV.Cloud.define('hello', m.handler)
} catch (err) {
  console.log('>>', err)
}

//AV.Cloud.define('hello', require('./cloud/hello'))

