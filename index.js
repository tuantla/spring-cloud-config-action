const core = require('@actions/core');
const github = require('@actions/github');

try {

  const configServerUrl = core.getInput('config-server-url');
  const workspace = core.getInput('workspace')
  console.log(`migrate from ${ workspace } config server: ${configServerUrl}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
