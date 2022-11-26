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
  context.log('HTTP trigger function processed a request.');
  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
    : 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.';
  const resp = await helpers.authorizeUser(req);
  let platform: 'Windows' | 'Android' | 'Meta' | 'iOS';
  const { items } = client.database('pwabuilder').container('project');
  if (resp) {
    platform = resp.platform as 'Windows' | 'Android' | 'Meta' | 'iOS';
    try {
      await items.query(
        'UPDATE user WHERE user.id="' +
          resp.id +
          '" AND user.url="' +
          resp.url +
          '" SET ' +
          platform +
          '=true, '
      );
    } catch (e) {
      context.log('Error updating document', e);
    }
  }
  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

async function getProjectDetailsByIdAndSiteUrl(
  userid: string,
  url: string
): Promise<any> {
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
  if (resources.length > 0) {
    return resources[0];
  }
  return null;
}

export default httpTrigger;
