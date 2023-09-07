const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const readYamlFile = require('read-yaml-file')

const patterns = ['**/application-*.yaml', '**/application-*.properties']

const flatten = (obj, path = '') => {
    if (!(obj instanceof Object)) return {[path.replace(/\.$/g, '')]:obj};

    return Object.keys(obj).reduce((output, key) => {
        return obj instanceof Array ?
             {...output, ...flatten(obj[key], path +  '[' + key + '].')}:
             {...output, ...flatten(obj[key], path + key + '.')};
    }, {});
}

class ConfigMigration {
  constructor(workingDir, url) {
    return this.init(workingDir, url)
  }

  async init(workingDir, url) {
    this.workingDir = workingDir
    this.url = url

    const globber = await glob.create(patterns.join('\n'))
    this.files =  await globber.glob()
    const data = readYamlFile.sync(files[0])

    console.log(flatten(data))
  }
}

async function run() {
  try {
    const configServerUrl = core.getInput('config-server-url');
    const workspace = core.getInput('workspace')
    console.log(`migrate from ${ workspace } config server: ${configServerUrl}!`);

    const migra = await new ConfigMigration(workspace, configServerUrl)


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
