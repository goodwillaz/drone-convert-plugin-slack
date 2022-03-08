/**
 * Copyright 2019 Goodwill of Central and Northern Arizona

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
const { parseRequest, verifyHMAC } = httpSignature;

const validator = secret => (req, res, next) => {
  const { signature, authorization } = req.headers;
  if (signature && !authorization) {
    req.headers.authorization = `Signature ${req.headers.signature}`;
  }

  if (!verifyHMAC(parseRequest(req), secret)) {
    throw new Error('Authorization header is not valid');
  }

  next();
};

export default function (plugin, secret, logger) {
  const app = express();

  // Setup some middleware to assist with the requests
  app.use(validator(secret));
  app.use(express.json());

  app.post('/', async (req, res) => {
    logger.debug(req.body);

    const yaml = await plugin.find(req.body);

    if (yaml === null) {
      logger.debug({ yaml: false });
      res.status(204).send();
      return;
    }

    res.set('Content-Type', 'application/json').send({ Data: yaml });
  });

  return app;
}
