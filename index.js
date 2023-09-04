const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const readYamlFile = require('read-yaml-file')

const patterns = ['**/application-*.yaml', '**/application-*.properties']

async function run() {
  try {
    const configServerUrl = core.getInput('config-server-url');
    const workspace = core.getInput('workspace')
    console.log(`migrate from ${ workspace } config server: ${configServerUrl}!`);

    const globber = await glob.create(patterns.join('\n'))
    const files =  await globber.glob()
    const data = readYamlFile.sync(files[0])
    console.log(data)
    // files.forEach((item, i) => {
    //   console.log(item)
    // });


    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
