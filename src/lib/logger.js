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

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const jsonFormat = printf(({ message, timestamp }) => {
  if (typeof message !== 'object') {
    message = { message };
  }
  message.time = timestamp;
  return JSON.stringify(message);
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    jsonFormat
  ),
  transports: [
    new transports.Console({ handleExceptions: true, colorize: true })
  ],
  exitOnError: true
});

export default logger;
