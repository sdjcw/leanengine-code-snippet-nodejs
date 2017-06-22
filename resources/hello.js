exports.handler = (_request) => {
  return 'Hello world!';
};

exports.init = () => {
  console.log('init...');
  return Promise.resolve();
};

exports.destroy = () => {
  console.log('destroy...');
  return Promise.resolve();
};

console.log('function loaded');
