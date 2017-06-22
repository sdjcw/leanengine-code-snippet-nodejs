const fs = require('fs');
const request = require('request-promise');

const appId = 'kdrt5GNCjojUjiIujawd5A4n-gzGzoHsz';
const masterKey = '5VYjOw5TKqjTFsAkcMnSMlhE';

const code = fs.readFileSync(process.argv[2], {encoding: 'utf-8'});

request({
  url: 'http://localhost:3000/_ops/cloudFunctions',
  method: 'PUT',
  headers: {
    'x-lc-id': appId,
    'x-lc-key': masterKey + ',master',
  },
  body: {
    name: process.argv[3],
    code,
  },
  json: true,
})
.then(body => {
  console.log('response >>', body);
});
