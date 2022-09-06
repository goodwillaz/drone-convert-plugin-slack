import chai from 'chai';
import { Plugin } from '../src/plugin.js';
import { loadAll as yamlParse } from 'js-yaml';

chai.should();

describe('plugin.js tests', () => {
  it ('should only add Slack notify before', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].name.should.equal('slack-before');
    yamlParse(result)[0].steps[0].image.should.equal('foo/bar');
    yamlParse(result)[0].steps.length.should.equal(2);
  });

  it ('should only add Slack notify after', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'after', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[1].name.should.equal('slack-after');
    yamlParse(result)[0].steps[1].image.should.equal('foo/bar');
    yamlParse(result)[0].steps.length.should.equal(2);
  });

  it ('should add Slack notify both before and after', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'both', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].name.should.equal('slack-before');
    yamlParse(result)[0].steps[2].name.should.equal('slack-after');
  });

  it ('should add environment variables to step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {SLACK_WEBHOOK: 'foo'});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].environment.should.have.property('PLUGIN_WEBHOOK', 'foo');
  });

  it ('should add STARTED env variable to begin step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].environment.should.have.property('PLUGIN_STARTED');
  });

  it ('should not add STARTED env variable to after step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'after', debug: false}, {SLACK_FOO:'BAR'});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[1].environment.should.not.have.property('PLUGIN_STARTED');
  });

  it ('should override WEBHOOK env when using webhook in yaml', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {SLACK_WEBHOOK: 'foo'});
    const result = plugin.run('---\nkind: pipeline\nslack:\n  webhook: bar\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].environment.should.have.property('PLUGIN_WEBHOOK', 'bar');
  });

  it ('should skip non-pipeline documents', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {SLACK_WEBHOOK: 'foo'});
    const result = plugin.run('---\nkind: foo\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps.length.should.equal(1);
  });

  it ('should not add before step when before notification exists', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: slack-before');
    yamlParse(result)[0].steps[0].image.should.equal('test');
  });

  it ('should not add after step when after notification exists', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'after', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: slack-after');
    yamlParse(result)[0].steps[0].image.should.equal('test');
  });

  it ('should only have success for the begin step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[0].when.status.should.have.members(['success']);
  });

  it ('should have success and failure for the after step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'after', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[1].when.status.should.have.members(['success', 'failure']);
  });

  it ('should only have failure for the after step', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'after', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nslack:\n  when:\n    - failure\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps[1].when.status.should.have.members(['failure']);
  });

  it ('should not include step when yaml config differs from global config', () => {
    const plugin = new Plugin({image: 'foo/bar', where: 'before', debug: false}, {});
    const result = plugin.run('---\nkind: pipeline\nslack:\n  where: after\nsteps:\n  - image: test\n    name: test');
    yamlParse(result)[0].steps.length.should.equal(1);
  });
});
