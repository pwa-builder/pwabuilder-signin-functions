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
  if (resp && resp.id) {
    const { database } = await client.databases.createIfNotExists({
      id: 'pwabuilder',
    });
    const { container } = await database.containers.createIfNotExists({
      id: 'user',
    });
    console.log(resp);
    const body = {
      id: resp.id,
      name: resp.displayName,
      lastLoggedIn: new Date(),
      email: resp.userPrincipalName || resp.mail || 'N/A',
    };
    context.log('Body', body);
    container.items.upsert(body);
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: body !== undefined ? body : null,
    };
  } else {
    context.res = {
      status: 500,
      body: 'User Not logged in',
    };
  }
};

export default httpTrigger;
