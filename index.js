const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const httpm = require('@actions/http-client');
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
  constructor(entityId, workingDir, url) {
    return this.init(entityId, workingDir, url)
  }

  async init(entityId, workingDir, url) {
    this.entityId = entityId
    this.workingDir = workingDir
    this.url = url

    const globber = await glob.create(patterns.join('\n'))
    this.files =  await globber.glob()
    await this.migrate(this.files)

  }

  async migrate() {
    for(let file of this.files) {
      await this.migrateSingleFile(file)
    }
  }

  async migrateSingleFile(file) {
    let env = this.getEnvironment(file)
    let service = this.getServiceName(file)
    await this.updateConfigItems(env, service, file)

  }

  async updateConfigItems(env, service, file){
    console.log(`${env}:${service} => ${file}`)
    let properties = flatten(readYamlFile.sync(file))
    let keys = Object.keys(properties)
    let http = new httpm.HttpClient('http-client-github-actions')
    let resp = await http.postJson(this.url, {}, {})
    console.log(resp)
    for(let key of keys) {
       await this.updateConfigItem(env, service, key, properties[key])
    }

  }

  async updateConfigItem(env, service, key, value ){
    console.log(`${env}:${service}:  ${key}=>${value}`)
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
    let re = new RegExp(/application-?(.*)\.ya?ml/,"i");
    let r = fileName.match(re)
    return r[1]
  }
}

async function run() {
  try {
    const configServerUrl = core.getInput('config-server-url');
    const workspace = core.getInput('workspace')
    const entityId = core.getInput('entity-id')
    console.log(`migrate config of ${entityId} from ${ workspace } config server: ${configServerUrl}!`);

    const migra = await new ConfigMigration(entityId, workspace, configServerUrl)


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
