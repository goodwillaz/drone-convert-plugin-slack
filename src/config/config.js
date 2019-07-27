import convict from 'convict'

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
  token: {
    format: String,
    doc: 'Github token',
    default: null,
    arg: 'token',
    env: 'PLUGIN_GITHUB_TOKEN'
  },
  image: {
    format: String,
    doc: 'Plugin to use',
    default: 'plugin/slack',
    arg: 'image',
    env: 'PLUGIN_IMAGE'
  },
  when: {
    format: ['before', 'after', 'both'],
    doc: 'When to apply Slack notification',
    default: 'after',
    arg: 'when',
    env: 'PLUGIN_WHEN'
  }
})

// Perform validation
config.validate({ allowed: 'strict' })

export default config.getProperties()
