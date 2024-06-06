module.exports = {
    testPathIgnorePatterns: ["/node_modules"],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    verbose: true,
    testMatch: ["**/test/**/**.spec.ts", "!**/test/**/*agc*.spec.ts"],
    testTimeout: 30000,
    globalSetup: `${__dirname}/jestSetup.js`,
    globalTeardown: `${__dirname}/jestTeardown.js`,
    testEnvironment: `${__dirname}/puppeteer_environment.js`
}