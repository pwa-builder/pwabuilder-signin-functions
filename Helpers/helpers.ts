import fetch from 'node-fetch';
module.exports = {
  authorizeUser: async function (req: any) {
    const token = req.headers.authorization;
    const resp = await callGraphApi(token);
    return resp;
  },
};
async function callGraphApi(accessToken: string): Promise<any> {
  const url = `https://graph.microsoft.com/v1.0/me`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: new fetch.Headers({
      Authorization: `${accessToken}`,
    }),
  });
  // If we got a 404, punt.
  if (resp.status == 404) {
    return Promise.reject(`Graph API returned 404 for ${url}`);
  }
  const body = await resp.json();
  return body;
}
