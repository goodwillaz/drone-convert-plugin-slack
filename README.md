## Drone.io Slack Config Plugin

This [Drone.io](https://drone.io) config plugin automatically adds Slack notifications before and/or after the steps in a pipeline.  It will work with the [official drone-slack](https://github.com/drone-plugins/drone-slack) plugin (default) or [Goodwill's drone-slack](https://github.com/goodwillaz/drone-slack) plugin (and probably any others floating around as long as they use PLUGIN_* environment variables for configuration).  

### Running

This plugin is available on [Docker Hub](https://hub.docker.com/r/goodwillaz/drone-config-plugin-slack) or you can optionally build and host yourself.

```bash
$ docker build --rm -t <your-repo>/drone-config-plugin-slack:latest .
$ drone push <your-repo>/drone-config-plugin-slack:latest
```

### Usage

#### Docker Compose

(Necessary config portion shown only)

```yaml
services:
  drone-server:
    ...
    environment:
      - DRONE_YAML_ENDPOINT=http://drone-config-plugin-slack:3000
      - DRONE_YAML_SECRET=${YAML_SECRET:?YAML_SECRET is required}
      ...
    depends_on:
      - drone-config-plugin-slack
      ...
  
  drone-config-plugin-slack:
    image: goodwillaz/drone-config-plugin-slack:latest
    environment:
      - PLUGIN_SECRET=${YAML_SECRET:?YAML_SECRET is required}
      - PLUGIN_GITHUB_TOKEN=${GITHUB_TOKEN}
      - SLACK_WEBHOOK=${SLACK_WEBHOOK}
```

#### .drone.yml file

You can add a global `slack` option to your pipeline in your .drone.yml to override some items.  Both of these are optional.  The `when` option accepts `true`, `'after'`, `'before'` and `'both'`.  The `webhook` option can be used to specify an alternate location to post Slack messages to (instead of the SLACK_WEBHOOK environment variable)

```yaml
---
kind: pipeline
name: testing
slack:
  when: false
  webhook: https://my.custom.slack.webhook/endpoint
```

#### Bypass

If a step already exists that is named `notify-before` or `notify-after`, this config plugin will not prepend or append Slack notifications to the pipeline.

### Environment Variable Support

Here's a full list of environment variables supported by the plugin:

* PLUGIN_SECRET (required)
* PLUGIN_GITHUB_TOKEN (required; only Github is currently supported as a source)
* PLUGIN_HOST (default: 0.0.0.0)
* PLUGIN_PORT (default: 3000)
* PLUGIN_IMAGE (default: plugin/slack)
* PLUGIN_WHEN - (default: after; allowed: [before, after, both]; official Drone plugin only supports `after`, Goodwill plugin supports all options)
* PLUGIN_DEBUG - (default: false)
* SLACK_ - any environment variable beginning with `SLACK_` is updated to `PLUGIN_` and passed through to the actual Slack plugin.
    
### Pipeline Support

This plugin also supports [microadam's config pipeline plugin](https://github.com/microadam/drone-config-plugin-pipeline).

### License

See the [LICENSE](LICENSE.md) file for license rights and limitations (BSD 3-clause).
