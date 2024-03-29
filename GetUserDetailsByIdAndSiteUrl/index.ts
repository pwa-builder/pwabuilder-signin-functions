import { AzureFunction, Context, HttpRequest } from '@azure/functions';
const helpers = require('../Helpers/helpers');
import { CosmosClient } from '@azure/cosmos';

const endpoint = process.env['Endpoint'];
const key = process.env['Key'];
const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const resp = await helpers.authorizeUser(req);
  if (resp) {
    const { items } = await client.database('sample').container('user');
    const { resources } = await items
      .query(
        'SELECT * FROM user WHERE user.id="' +
          resp.id +
          '" AND user.url="' +
          req.body.url +
          '"'
      )
      .fetchAll();
    context.log('Resources', resources);
    context.res = {
      // status: 200, /* Defaults to 200 */
      body:
        resources !== undefined && resources.length > 0
          ? JSON.stringify(resources[0])
          : null,
    };
  } else {
    context.res = {
      status: 500,
      body: 'User Not logged in',
    };
  }
};

export default httpTrigger;
