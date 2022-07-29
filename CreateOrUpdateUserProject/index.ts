import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
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
  const queryResult = await getUserDetailsByIdAndSiteUrl(resp.id, req.body.url);
  const body = {
    // create a random ID
    ...req.body,
    id: resp.id,
  };

  if (!validateUserProjectDetails(body)) {
    context.res = {
      body: 'URL or user ID invalid. Please try again.',
    };
  }
  context.log('Updating existing project');
  await upsertUserDetails(body);
  // }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'Succesfully added/updated project',
  };
};

function validateUserProjectDetails(body): boolean {
  if (body.userid == null || body.url) {
    return false;
  }
  return true;
}

async function upsertUserDetails(body: string) {
  const { database } = await client.databases.createIfNotExists({
    id: 'pwabuilder',
  });
  const { container } = await database.containers.createIfNotExists({
    id: 'project',
  });
  container.items.upsert(body);
}

async function getUserDetailsByIdAndSiteUrl(
  userid: string,
  url: string
): Promise<any[]> {
  const { items } = client.database('pwabuilder').container('project');

  const { resources } = await items
    .query(
      'SELECT * FROM user WHERE user.id="' +
        userid +
        '" AND user.url="' +
        url +
        '"'
    )
    .fetchAll();
  console.log('GET USER DETAILS RESULT', userid, url, resources);
  return resources;
}

export default httpTrigger;
