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
  const body = {
    // create a random ID
    url: req.body.url,
    lastTested: req.body.lastTested,
    maniResult: req.body.maniResult,
    swResult: req.body.swResult,
    secResult: req.body.secResult,
    windowsPackageOptions: req.body.windowsPackageOptions ?? null,
    androidPackageOptions: req.body.androidPackageOptions ?? null,
    oculusPackageOptions: req.body.oculusPackageOptions ?? null,
    iosPackageOptions: req.body.iosPackageOptions ?? null,
    id: resp.id,
  };

  if (!validateUserProjectDetails(body)) {
    context.res = {
      body: 'URL or user ID invalid. Please try again.',
    };
  }
  await upsertUserDetails(body);
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

async function upsertUserDetails(body: any) {
  const { database } = await client.databases.createIfNotExists({
    id: 'pwabuilder',
  });
  const { container } = await database.containers.createIfNotExists({
    id: 'project',
  });
  container.items.upsert(body);
}

export default httpTrigger;
