const request = require('request-promise');

const appId = 'kdrt5GNCjojUjiIujawd5A4n-gzGzoHsz';
const masterKey = '5VYjOw5TKqjTFsAkcMnSMlhE';

request({
  url: 'http://localhost:3000/_ops/cloudFunctions?includeCode=true',
  method: 'GET',
  headers: {
    'x-lc-id': appId,
    'x-lc-key': masterKey + ',master',
  },
  json: true,
})
.then(body => {
  console.log('response >>', body);
});
