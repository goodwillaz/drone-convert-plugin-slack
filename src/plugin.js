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

import GitHub from 'github-api';
import { loadAll as yamlParse, dump as yamlDump } from 'js-yaml';
import logger from './lib/logger';

class Plugin {
  constructor ({ debug, token, image, when }) {
    this.debug = debug;
    this.image = image;
    this.when = when;
    this.gh = new GitHub({ token });
    this.slackEnv = this.getSlackEnv();
  }

  getSlackEnv () {
    // Get all of the environment variables ...
    const environment = Object.keys(process.env)
      // ... passed in for Slack ...
      .filter(key => key.match(/^SLACK_/))
      // ... and combine into a new object, with SLACK_ replaced with PLUGIN_
      .reduce(
        (res, key) => Object.assign(res, { [key.replace(/^SLACK_/, 'PLUGIN_')]: process.env[key] }),
        {} // Initial value, needs to be an empty object
      );

    logger.debug({ slack: environment });

    return environment;
  }

  getSlackStep (when, webhook) {
    const environment = Object.assign({}, this.slackEnv);

    if (when === 'before') {
      environment.PLUGIN_STARTED = true;
    }

    // Custom webhook URL specified in the document
    if (webhook) {
      environment.PLUGIN_WEBHOOK = webhook;
    }

    return {
      name: `notify-${when}`,
      image: this.image,
      environment,
      when: {
        status: ['success', 'failure']
      }
    };
  }

  async find (req) {
    logger.debug({ req });

    let yaml;
    try {
      // Are we pipelined from another plugin, if not get the original config file; return null if it can't be found
      yaml = req.yaml || await this.getDroneYaml(req);
      logger.debug({ yaml });
    } catch (err) {
      logger.warn(err);
      return null;
    }

    // Parse the yaml (could be multiple documents in one file)
    const documents = [];
    yamlParse(yaml, this.docProcessor(documents));

    // Return the modified yaml
    const modifiedYaml = '---\n' +
      documents
        .map(doc => yamlDump(doc, { noRefs: true, lineWidth: 500 }))
        .join('\n---\n');
    logger.debug({ modifiedYaml });

    return modifiedYaml;
  }

  async getDroneYaml ({ repo: { namespace, name, config_path: configPath }, build: { after: afterHash } }) {
    const response = await this.gh.getRepo(namespace, name).getContents(afterHash, configPath, true);
    return response.data;
  }

  docProcessor (documents) {
    return (doc) => {
      if (doc.kind !== 'pipeline') {
        return documents.push(doc);
      }

      if (this.addStep(doc, 'before')) {
        doc.steps.unshift(this.getSlackStep('before', doc.slack?.webhook ?? false));
      }
      if (this.addStep(doc, 'after')) {
        doc.steps.push(this.getSlackStep('after', doc.slack?.webhook ?? false));
      }

      documents.push(doc);
    };
  }

  addStep (doc, where) {
    return [where, 'both'].includes(this.when) && // Is plugin configured to do this action
      ([true, where, 'both'].includes(doc.slack?.when ?? true)) && // If we have a slack option in the doc, what does it say?
      !this.hasNotifyStep(doc, where); // Does it already have a step
  }

  hasNotifyStep (doc, when) {
    return doc.steps.filter(step => step.name === `notify-${when}`).length > 0;
  }
}

export default Plugin;
