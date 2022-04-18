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
  //   console.log(resp);
  if (resp) {
    const { items } = await client.database('sample').container('user');
    context.log('This is the id', resp.id);
    const { resources } = await items
      .query('SELECT * FROM c WHERE c.userid="' + resp.id + '"')
      .fetchAll();
    context.log('Resources', resources);
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: resources !== undefined && resources.length > 0 ? resources : null,
    };
  } else {
    context.res = {
      status: 500,
      body: 'User Not logged in',
    };
  }
};

export default httpTrigger;
