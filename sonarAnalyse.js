const scanner = require('sonarqube-scanner');
scanner(
    {
        serverUrl: "https://sonar.thibaultsouquet.fr",
        options: {
            'sonar.projectKey': 'svalinn-discord-bot',
            'sonar.sources': '.',
            'sonar.login': 'a0bc4034df242d95ec5af92f2ddc6a68d8db8cbf',
            'sonar.projectVersion': '2.0',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.typescript.tslint.reportPaths': 'report.json',
            'sonar.exclusions': 'sonarAnalyse.js',
            'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info'
        }
    }, () => {
        // Callback is required
    }
);
