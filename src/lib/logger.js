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

import { createLogger, format, transports } from 'winston';

const { splat, combine, timestamp, printf } = format;

const jsonFormat = printf(({ timestamp, level, message, ...meta }) => {
  return `${timestamp};${level};${message};${meta ? JSON.stringify(meta) : ''}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    splat(),
    jsonFormat
  ),
  transports: [
    new transports.Console({ handleExceptions: true })
  ],
  exitOnError: true
});

export default logger;
