const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const patterns = ['**/application-*.yaml', '**/application-*.properties']

try {

  const configServerUrl = core.getInput('config-server-url');
  const workspace = core.getInput('workspace')
  console.log(`migrate from ${ workspace } config server: ${configServerUrl}!`);

  const globber = glob.create(patterns.join('\n'))
  const files =  globber.glob()
  files.forEach((item, i) => {
    console.log(item)
  });


  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
