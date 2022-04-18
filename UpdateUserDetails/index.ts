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
  const name = req.query.name || (req.body && req.body.name);
  context.log('This was hit');
  const resp = await helpers.authorizeUser(req);

  //In case the entry exists already
  const queryResult = await getUserDetailsByIdAndSiteUrl(
    resp.id,
    req.body.siteUrl
  );
  const body = {
    // create a random ID
    ...req.body,
    userid: resp.id,
  };
  if (queryResult.length == 0) {
    context.log('inserting', body);
    context.bindings.document = JSON.stringify(body);
  } else {
    context.log('Query result ', queryResult);
    body.id = queryResult[0].id;
    context.log('Upserting');
    await upsertUserDetails(body);
  }

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: 'responseMessage',
  };
};

async function upsertUserDetails(body: string) {
  const { database } = await client.databases.createIfNotExists({
    id: 'sample',
  });
  const { container } = await database.containers.createIfNotExists({
    id: 'user',
  });
  console.log('Body upsert', body);
  container.items.upsert(body);
}
async function getUserDetailsByIdAndSiteUrl(
  userid: string,
  siteUrl: string
): Promise<any[]> {
  const { items } = await client.database('sample').container('user');

  const { resources } = await items
    .query(
      'SELECT * FROM user WHERE user.userid="' +
        userid +
        '" AND user.siteUrl="' +
        siteUrl +
        '"'
    )
    .fetchAll();

  return resources;
}

export default httpTrigger;
