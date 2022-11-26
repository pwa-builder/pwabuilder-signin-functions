import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CosmosClient, PatchOperation } from '@azure/cosmos';
const helpers = require('../Helpers/helpers');
const endpoint = process.env['Endpoint'];
const key = process.env['Key'];
const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('HTTP trigger function processed a request.');
  const resp = await helpers.authorizeUser(req);

  //In case the entry exists already
  if (!validateUserProjectDetails(req.body)) {
    context.res = {
      body: 'URL or user ID invalid. Please try again.',
    };
  }
  context.log('Updating package options', req.body);
  await upsertPackageOptions(resp.id, req.body);
  // }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'Succesfully added/updated project',
  };
};

function validateUserProjectDetails(body): boolean {
  if (body.userid == null || body.url == null) {
    return false;
  }
  return true;
}

async function upsertPackageOptions(id: string, body: any) {
  const { items } = client.database('pwabuilder').container('project');
  const { database } = await client.databases.createIfNotExists({
    id: 'pwabuilder',
  });
  const { container } = await database.containers.createIfNotExists({
    id: 'project',
  });
  const operations = [
    {
      op: 'replace',
      path: '/' + (body.platform as string).toLowerCase() + 'PackageOptions',
      value: body.options,
    },
  ] as PatchOperation[];

  await container.item(id, body.url).patch({ operations });
}

export default httpTrigger;
