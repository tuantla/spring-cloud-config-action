const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const readYamlFile = require('read-yaml-file')
const path = require('path')

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
    await this.migrateSingleFile(this.files[1])

  }

  async migrate() {
    for(let file of this.files) {
      await this.migrateSingleFile(file)
    }
  }

  async migrateSingleFile(file) {
    console.log(this.getEnvironment(file))
    //console.log(this.getServiceName(file))
    // console.log(path.dirname(file))
    // const data = readYamlFile.sync(file)
    //console.log(flatten(data))
  }

  getServiceName(file) {
    let parentFolder = path.dirname(file)
    if (this.workingDir == parentFolder) {
      return '*'
    } else {
      return path.basename(parentFolder)
    }
  }

  getEnvironment(file) {
    let fileName = path.basename(file)
    console.log(fileName)
    let re = new RegExp(/application-?(.*).ya?ml/,"i");
    let r = fileName.match(re)
    return r[1]
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
