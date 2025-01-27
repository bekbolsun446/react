/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const {spawn} = require('child_process');

/**
 * Get the platform-specific path for the `danger-ci` binary
 * @returns {string} - Path to danger-ci executable
 */
const getDangerPath = () =>
    path.join('node_modules', '.bin', `danger-ci${process.platform === 'win32' ? '.cmd' : ''}`);

/**
 * Determine the release channel
 * @returns {string} - Either "experimental" or "stable"
 */
const getReleaseChannel = () =>
    process.env.RELEASE_CHANNEL === 'experimental' ? 'experimental' : 'stable';

/**
 * Retrieve the GitHub API token from environment variables
 * @returns {string} - The GitHub token
 */
const getToken = () => {
    const token = process.env.DANGER_GITHUB_API_TOKEN;
    if (!token) {
        console.error('DANGER_GITHUB_API_TOKEN is not set. Please provide a valid GitHub token.');
        process.exit(1);
    }
    return token;
};

/**
 * Run the Danger CI tool
 */
const runDanger = () => {
    const dangerPath = getDangerPath();
    const token = getToken();
    const releaseChannel = getReleaseChannel();

    spawn(dangerPath, ['--id', releaseChannel], {
        stdio: 'inherit', // Allow colors and logs to pass through
        env: {
            ...process.env, // Keep existing environment variables
            DANGER_GITHUB_API_TOKEN: token, // Add the GitHub token
        },
    }).on('close', (code) => {
        if (code !== 0) {
            console.error(`Danger failed with exit code ${code}`);
        } else {
            console.log('Danger passed successfully.');
        }
        process.exit(code);
    });
};

// Run the script
runDanger();
