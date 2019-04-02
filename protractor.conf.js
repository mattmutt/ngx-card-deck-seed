// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');
const localPort = process.env.PORT || 4200;



exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    "chromeOptions": {
      "args": [
        "--no-sandbox", "--headless", "--disable-gpu", "--window-size=1920x800"
      ]
    }
  },
  directConnect: true,
  baseUrl: "http://localhost:" + localPort + "/",
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    }
  },

  beforeLaunch: function () {


    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
  }

};
