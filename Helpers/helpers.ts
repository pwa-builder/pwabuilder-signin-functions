import nodeFetch from 'node-fetch';
module.exports = {
  authorizeUser: async function (req: any) {
    const token = req.headers.authorization;
    return await callGraphApi(token);
  },
};
async function callGraphApi(accessToken: string): Promise<any> {
  const url = `https://graph.microsoft.com/v1.0/me`;
  const resp = await nodeFetch(url, {
    method: 'GET',
    headers: new nodeFetch.Headers({
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
