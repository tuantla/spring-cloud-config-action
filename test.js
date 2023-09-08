const ConfigMigration = require('./config-migrate.mjs')


async function runTests() {
  try {
    const configServerUrl = 'http://localhost:8888/configuration-service/1.0.0/properties'
    const workspace = '/opt/projects/101digital/imp-dev/adb-configurations'
    const entityId = '101D'
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

runTests()
