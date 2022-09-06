/**
 * Copyright 2022 Goodwill of Central and Northern Arizona

 * Licensed under the BSD 3-Clause (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * https://opensource.org/licenses/BSD-3-Clause

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from 'express';
import httpSignature from 'http-signature';
import 'express-async-errors';
import logger from './lib/logger.js';
import { Plugin } from './plugin.js';
const { parseRequest, verifyHMAC } = httpSignature;

const validator = secret => (req, res, next) => {
  if (req.path === '/ping' || verifyHMAC(parseRequest(req, {}), secret)) {
    return next();
  }

  throw new Error('Authorization header is not valid');
};

export default function (config) {
  const app = express();

  // Setup some middleware to assist with the requests
  app.use(validator(config.secret));
  app.use(express.json());

  const plugin = new Plugin(config, process.env);

  app.get('/ping', (req, res) => {
    logger.info('Ping');
    res.set('Content-Type', 'text/plain').send('pong');
  });

  app.post('/', async ({ body }, res) => {
    logger.debug('Request body', body);

    const config = plugin.run(body.config.data);

    res
      .set('Content-Type', 'application/json')
      .send({ data: config ?? body.config.data });
  });

  return app;
}
