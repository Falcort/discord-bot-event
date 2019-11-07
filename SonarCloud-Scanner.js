const scanner = require('sonarqube-scanner');
const nodePackage = require('./package.json');
scanner(
    {
        options: {
            'sonar.host.url': 'https://sonarcloud.io',
            'sonar.projectKey': 'Falcort_discord-bot-event',
            'sonar.organization': 'tsouquet-back',
            'sonar.projectVersion': nodePackage.version,
            'sonar.sources': '.',
            'sonar.login': process.env.SONAR_TOKEN,
            'sonar.projectName': 'Discord Bot Event',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.typescript.tslint.reportPaths': 'report.json',
            'sonar.typescript.tsconfigPath': 'tsconfig.json',
            'sonar.exclusions': 'SonarCloud-Scanner.js',
            'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info'
        }
    }, () => {
        // Callback is required
    }
);
