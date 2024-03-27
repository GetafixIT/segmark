const { segmark } = require('./lib/segmark.min.js');

(async () => {
  const segmarkMarkdown = `
±myVar
# My title
Some para
±myVar

±myOtherVar
# My Other title
Some other para
±myOtherVar
`;
  const obj = await segmark(segmarkMarkdown);

  console.log('obj', JSON.stringify(obj));
})();
