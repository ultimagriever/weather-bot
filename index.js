'use strict';
let env = require('dotenv');
let { Wit, interactive } = require('node-wit');

env.config({ silent: true });

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node index.js <wit-access-token>');
    process.exit(1);
  }

  return process.argv.pop();
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] && Array.isArray(entities[entity]) && entities[entity].length > 0 && entities[entity][0].value;

  if (!val) {
    return null;
  }

  return typeof val === 'object' ? val.value : val;
}

const actions = new class {
  send(request, response) {
    const { sessionId, context, entities } = request;
    const { text, quickReplies } = response;

    return new Promise((resolve, reject) => {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  }

  getForecast({context, entities}) {
    return new Promise((resolve, reject) => {
      let location = firstEntityValue(entities, "location");
      if (location) {
        context.forecast = 'chuvoso em ' + location;
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.forecast;
      }
      return resolve(context);
    })
  }
}

const client = new Wit({accessToken, actions});
interactive(client);
