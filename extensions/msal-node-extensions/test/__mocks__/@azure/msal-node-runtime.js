/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const mock = jest.requireActual("@azure/msal-node-runtime");

// Only mock on Windows so that we can test that non supported systems properly report that the broker is unavailable
if (process.platform === "win32") {
    const asyncHandle = {
        CancelAsyncOperation: () => {},
    };
    mock.msalNodeRuntime = {
        ReadAccountByIdAsync: (accountId, correlationId, callback) =>
            asyncHandle,
        SignInAsync: (
            windowHandle,
            authParams,
            correlationId,
            accountHint,
            callback
        ) => asyncHandle,
        SignInSilentlyAsync: (authParams, correlationId, callback) =>
            asyncHandle,
        SignInInteractivelyAsync: (
            windowHandle,
            authParams,
            correlationId,
            accountHint,
            callback
        ) => asyncHandle,
        AcquireTokenSilentlyAsync: (
            authParams,
            correlationId,
            account,
            callback
        ) => asyncHandle,
        AcquireTokenInteractivelyAsync: (
            windowHandle,
            authParams,
            correlationId,
            account,
            callback
        ) => asyncHandle,
        SignOutSilentlyAsync: (clientId, correlationId, account, callback) =>
            asyncHandle,
        RegisterLogger: (callback, isPiiEnabled) => {},
        DiscoverAccountsAsync: (clientId, correlationId, callback) =>
            asyncHandle,
        StartupError: undefined,
        AuthParameters: mock.msalNodeRuntime.AuthParameters,
    };
}

module.exports = mock;
