import * as core from '@actions/core';
import url =  require('url'); 
const https = require('https');

async function run() {
  try {
    const esquioUrl = core.getInput('esquio-url');
    const esquioApiKey = core.getInput('esquio-api-key');
    const productName = core.getInput('product-name');
    const featureName = core.getInput('feature-name');
    const deploymentName = core.getInput('deployment-name');

    await rollbackFeature(url.parse(esquioUrl), esquioApiKey, productName, featureName, deploymentName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function rollbackFeature(esquioUrl: url.UrlWithStringQuery, esquioApiKey: string, productName: string, featureName: string, deploymentName: string) {
  const options = {
      hostname: esquioUrl.host,
      path: `/api/products/${productName}/deployments/${deploymentName}/features/${featureName}/rollback`,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'x-api-key': esquioApiKey,
          'x-api-version': '3.0'
      }
  }
  console.log(`url to call ${esquioUrl.host} ${options.path}`);
  const req = https.request(options, (res: any) => {
    
      if (res.statusCode === 200) {
          console.log('Feature rollback succesful');
      }

      res.on('data', (data: any) => {
          if (res.statusCode != 200) {
              const responseData = JSON.parse(data);
              core.setFailed(`Error in feature rollback ${responseData.detail} HttpCode: ${res.statusCode}`);
          }
      });
  });
  req.on('error', (error: any) => {
    core.setFailed(error);
  });

  req.end();
}

run();
