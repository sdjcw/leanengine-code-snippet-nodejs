'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const requireFromString = require('require-from-string');
const AV = require('leanengine');
const lcHeaders = require('leanengine/middleware/leancloud-headers')(AV)({restrict: true});

const app = express();
app.use(AV.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let codeModules = [];

app.get('/_ops/cloudFunctions', lcHeaders, (req, res, next) => {
  if (!req.AV.authMasterKey) {
    const err = new Error('Unauthorized');
    err.status = 401;
    next(err);
    return;
  }
  
  const includeCode = JSON.parse(req.query.includeCode || false);
  const result = codeModules.map(codeModule => {
    if (includeCode) {
      return _.pick(codeModule, ['name', 'version', 'code']);
    }
    return _.pick(codeModule, ['name', 'version']);
  });
  res.send(result);
});

app.put('/_ops/cloudFunctions', lcHeaders, (req, res, next) => {
  if (!req.AV.authMasterKey) {
    const err = new Error('Unauthorized');
    err.status = 401;
    next(err);
    return;
  }

  const {name, code, version} = req.body;
  let newModule, oriModule;
  Promise.resolve()
  .then(() => {
    newModule = {
      name,
      code,
      module: requireFromString(code),
      version,
    };
    if (!newModule.module.handler) {
      throw new Error('云函数模块必须有 handler 方法');
    }
  })
  .then(() => {
    const oriModule = _.find(codeModules, {name});
    if (oriModule && oriModule.module.destroy && typeof oriModule.module.destroy === 'function') {
      return oriModule.module.destroy().catch((err) => {
        console.err(`更新云函数模块时，销毁旧模块出错，虽然不影响模块更新，但是可能因为销毁旧模块失败导致资源清理不完全，产生内存泄漏。
  name: ${name}, version: ${oriModule.version}, err: ${err.stack || err}`);
      });
    }
  })
  .then(() => {
    return initAndDefine(newModule)
    .then(() => {
      codeModules = _.reject(codeModules, {name});
      codeModules.push(newModule);
      res.status(204).send();
    },
    (err) => {
      if (oriModule) {
        initAndDefine(oriModule)
        .then(() => {
          throw err;
        }, (err2) => {
          throw new Error(`新模块加载失败，回滚加载旧模块也失败：
  载新模块异常: ${err.stack || err}
  滚旧模块异常: ${err2.stack || err2}`);
        });
      }
    });
  })
  .catch((err) => {
    err.status = 400;
    next(err);
  });
});

const initAndDefine = ({name, module}) => {
  return Promise.resolve()
  .then(() => {
    if (module.init && typeof module.init === 'function') {
      return module.init();
    }
  })
  .then(() => {
    AV.Cloud.define(name, {rewrite: true}, module.handler);
  });
};

app.use(function(req, res, next) {
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

app.use(function(err, req, res, _next) {
  var statusCode = err.status || 500;
  res.status(statusCode);
  res.send(err.message);
});

module.exports = app;
