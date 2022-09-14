## Drone.io Slack Conversion Plugin

This [Drone.io](https://drone.io) conversion plugin automatically adds Slack notifications before and/or after the steps in a pipeline.  It will work with the [official drone-slack](https://github.com/drone-plugins/drone-slack) plugin (default) or [Goodwill's drone-slack](https://github.com/goodwillaz/drone-slack) plugin (and probably any others floating around as long as they use PLUGIN_* environment variables for configuration).  

### Running

This plugin is available via [Github's packages](https://github.com/goodwillaz/drone-convert-plugin-slack/packages) or you can optionally build and host yourself.

```bash
$ docker build --rm -t <your-repo>/drone-convert-plugin-slack:latest .
$ drone push <your-repo>/drone-convert-plugin-slack:latest
```

### Usage

#### Docker Compose

(Necessary config portion shown only)

```yaml
services:
  drone-server:
    ...
    environment:
      - DRONE_YAML_ENDPOINT=http://drone-convert-plugin-slack:3000
      - DRONE_YAML_SECRET=${YAML_SECRET:?YAML_SECRET is required}
      ...
    depends_on:
      - drone-convert-plugin-slack
      ...
  
  drone-convert-plugin-slack:
    image: goodwillaz/drone-convert-plugin-slack:latest
    environment:
      - PLUGIN_SECRET=${YAML_SECRET:?YAML_SECRET is required}
      - PLUGIN_GITHUB_TOKEN=${GITHUB_TOKEN}
      - SLACK_WEBHOOK=${SLACK_WEBHOOK}
```

#### .drone.yml file

You can add a global `slack` option to your pipeline in your .drone.yml to override some items.  These are optional.  The `where` option accepts `false`, `true`, `'after'`, `'before'` and `'both'`.  The `webhook` option can be used to specify an alternate location to post Slack messages to (instead of the SLACK_WEBHOOK environment variable).  The `when` option can be used to specify when to trigger the `slack-after` step (only accepted values are `success` and `failure`).  If you only want failure notifications, set `where` to `after` and set `when` to an array with one element of `failure`.

```yaml
---
kind: pipeline
name: testing
slack:
  where: false
  webhook: https://my.custom.slack.webhook/endpoint
  when: 
    - success
    - failure
```

#### Bypass

If a step already exists that is named `slack-before` or `slack-after`, this conversion plugin will not prepend or append Slack notifications to the pipeline.

### Environment Variable Support

Here's a full list of environment variables supported by the plugin:

* PLUGIN_SECRET (required)
* PLUGIN_GITHUB_TOKEN (required; only Github is currently supported as a source)
* PLUGIN_HOST (default: 0.0.0.0)
* PLUGIN_PORT (default: 3000)
* PLUGIN_IMAGE (default: goodwillaz/drone-slack)
* PLUGIN_WHERE - (default: after; allowed: [before, after, both]; official Drone plugin only supports `after`, Goodwill plugin supports all options)
* PLUGIN_DEBUG - (default: false)
* SLACK_ - any environment variable beginning with `SLACK_` is updated to `PLUGIN_` and passed through to the actual Slack plugin.
    
### Pipeline Support

This plugin also supports [our convert plugin pipeline](https://github.com/goodwillaz/drone-convert-plugin-pipeline).

### License

See the [LICENSE](LICENSE.md) file for license rights and limitations (BSD 3-clause).
