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

import { loadAll as yamlParse, dump as yamlDump } from 'js-yaml';
import logger from './lib/logger.js';

export class Plugin {
  constructor ({ debug, image, where }, env) {
    this.debug = debug;
    this.image = image;
    this.where = where;
    this.slackEnv = this.getSlackEnv(env);
  }

  getSlackEnv (env) {
    // Get all the environment variables ...
    const environment = Object.keys(env)
      // ... passed in for Slack ...
      .filter(key => key.match(/^SLACK_/))
      // ... and combine into a new object, with SLACK_ replaced with PLUGIN_
      .reduce(
        (res, key) => Object.assign(res, { [key.replace(/^SLACK_/, 'PLUGIN_')]: env[key] }),
        {} // Initial value, needs to be an empty object
      );

    logger.debug('Slack environment variables', { environment });

    return environment;
  }

  getSlackStep (when, where, webhook) {
    const environment = Object.assign({}, this.slackEnv);

    if (where === 'before') {
      environment.PLUGIN_STARTED = true;
    }

    // Custom webhook URL specified in the document
    if (webhook) {
      environment.PLUGIN_WEBHOOK = webhook;
    }

    // If we have these in the doc, use it, otherwise default to success and failure
    when = when ?? ['success', 'failure'];

    return {
      name: `slack-${where}`,
      image: this.image,
      environment,
      when: {
        status: when
      }
    };
  }

  run (config) {
    logger.debug('Configuration', { config });

    // Parse the yaml (could be multiple documents in one file)
    const documents = [];
    yamlParse(config, this.docProcessor(documents));

    // Return the modified yaml
    const modifiedConfig = '---\n' +
      documents
        .map(doc => yamlDump(doc, { noRefs: true, lineWidth: 500 }))
        .join('\n---\n');
    logger.debug('Modified configuration', { modifiedConfig });

    return modifiedConfig;
  }

  docProcessor (documents) {
    return (doc) => {
      if (doc.kind !== 'pipeline') {
        return documents.push(doc);
      }

      const webhook = doc.slack?.webhook ?? null;
      if (this.shouldAddStep(doc, 'before')) {
        doc.steps.unshift(this.getSlackStep(['success'], 'before', webhook));
      }
      const when = doc.slack?.when ?? null;
      if (this.shouldAddStep(doc, 'after')) {
        doc.steps.push(this.getSlackStep(when, 'after', webhook));
      }

      documents.push(doc);
    };
  }

  shouldAddStep (doc, where) {
    // Is plugin configured to do this action
    return [where, 'both'].includes(this.where) &&
      // If we have a slack option in the doc, what does it say?
      ([true, where, 'both'].includes(doc.slack?.where ?? true)) &&
      // Does it already have a step
      !this.hasSlackStep(doc, where);
  }

  hasSlackStep (doc, where) {
    return doc.steps.filter(step => step.name === `slack-${where}`).length > 0;
  }
}
