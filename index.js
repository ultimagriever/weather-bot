'use strict';
let env = require('dotenv');
let querystring = require('querystring');
let request = require('request');
let { Wit, interactive } = require('node-wit');

env.config({ silent: true });

const accessToken = (() => {
  if (!process.env.WIT_ACCESS_TOKEN) {
    console.log('You must provide a WIT_ACCESS_TOKEN in your environment');
    process.exit(1);
  }

  return process.env.WIT_ACCESS_TOKEN;
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
      console.log(text);
      return resolve();
    });
  }

  getForecast({context, entities}) {
    return new Promise((resolve, reject) => {
      let location = firstEntityValue(entities, "location");
      if (location) {
        request('http://api.openweathermap.org/data/2.5/weather?units=metric&q=' + querystring.escape(location) + '&APPID=' + process.env.WEATHER_API_KEY, (error, response, body) => {
          if (!error && response.statusCode === 200) {

            let forecast = JSON.parse(body);

            context.forecast = forecast.weather[0].description + ' em ' + location + ', temperatura média de ' + forecast.main.temp + '°C';
            delete context.missingLocation;

            return resolve(context);
          }
        });
      } else {
        context.missingLocation = true;
        delete context.forecast;
        return resolve(context);
      }
    })
  }
}

const client = new Wit({accessToken, actions});
interactive(client);
