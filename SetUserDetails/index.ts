const helpers = require('../Helpers/helpers');
module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');
  const resp = await helpers.authorizeUser(req);
  if (resp && req.body) {
    context.log('Request body', req.body);
    context.bindings.document = JSON.stringify({
      // create a random ID
      ...req.body,
      id: resp.id,
    });
  } else {
    context.res = {
      status: 500,
      body: 'User Not logged in',
    };
  }
};
