import convict from 'convict';
import formats from 'convict-format-with-validator';

convict.addFormats(formats);

const config = convict({
  debug: {
    format: Boolean,
    doc: 'Debug',
    default: false,
    arg: 'debug',
    env: 'PLUGIN_DEBUG'
  },
  host: {
    format: 'ipaddress',
    doc: 'Address',
    default: '0.0.0.0',
    arg: 'host',
    env: 'PLUGIN_HOST'
  },
  port: {
    format: 'port',
    doc: 'Port',
    default: 3000,
    arg: 'port',
    env: 'PLUGIN_PORT'
  },
  secret: {
    format: String,
    doc: 'Secret for communication',
    default: null,
    arg: 'secret',
    env: 'PLUGIN_SECRET'
  },
  image: {
    format: String,
    doc: 'Plugin to use',
    default: 'goodwillaz/drone-slack',
    arg: 'image',
    env: 'PLUGIN_IMAGE'
  },
  where: {
    format: ['before', 'after', 'both'],
    doc: 'Where to apply Slack notification',
    default: 'after',
    arg: 'where',
    env: 'PLUGIN_WHERE'
  }
});

// Perform validation
config.validate({ allowed: 'strict' });

export default config.getProperties();
