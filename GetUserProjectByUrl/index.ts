import { AzureFunction, Context, HttpRequest } from '@azure/functions';
const helpers = require('../Helpers/helpers');
import { CosmosClient, Item } from '@azure/cosmos';

const endpoint = process.env['Endpoint'];
const key = process.env['Key'];
const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  const resp = await helpers.authorizeUser(req);
  if (resp) {
    try {
      const { database } = await client.databases.createIfNotExists({
        id: 'pwabuilder',
      });
      const { container } = await database.containers.createIfNotExists({
        id: 'project',
      });
      const { resource } = await container.item(resp.id, req.query.url).read();
      if (resource !== null) {
        context.res = {
          // status: 200, /* Defaults to 200 */
          body: resource !== undefined ? resource : null,
        };
      }
    } catch (e) {
      context.log('Error fetching project by url', e);
    }
  } else {
    context.res = {
      status: 500,
      body: 'User Not logged in',
    };
  }
};

export default httpTrigger;
