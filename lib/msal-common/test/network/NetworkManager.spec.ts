/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import sinon from "sinon";
import { ThrottlingUtils } from "../../src/network/ThrottlingUtils";
import { RequestThumbprint } from "../../src/network/RequestThumbprint";
import {
    NetworkManager,
    NetworkResponse,
} from "../../src/network/NetworkManager";
import { ServerAuthorizationTokenResponse } from "../../src/response/ServerAuthorizationTokenResponse";
import { MockStorageClass, mockCrypto } from "../client/ClientTestUtils";
import { NetworkRequestOptions } from "../../src/network/INetworkModule";
import { ServerError } from "../../src/error/ServerError";
import {
    AUTHENTICATION_RESULT,
    NETWORK_REQUEST_OPTIONS,
    THUMBPRINT,
    THROTTLING_ENTITY,
    DEFAULT_NETWORK_IMPLEMENTATION,
    TEST_CONFIG,
} from "../test_kit/StringConstants";
import {
    ClientAuthError,
    ClientAuthErrorCodes,
} from "../../src/error/ClientAuthError";
import { Logger } from "../../src/logger/Logger";

describe("NetworkManager", () => {
    describe("sendPostRequest", () => {
        afterEach(() => {
            sinon.restore();
        });

        it("returns a response", async () => {
            const networkInterface = DEFAULT_NETWORK_IMPLEMENTATION;
            const cache = new MockStorageClass(
                TEST_CONFIG.MSAL_CLIENT_ID,
                mockCrypto,
                new Logger({})
            );
            const networkManager = new NetworkManager(networkInterface, cache);
            const thumbprint: RequestThumbprint = THUMBPRINT;
            const options: NetworkRequestOptions = NETWORK_REQUEST_OPTIONS;
            const mockRes: NetworkResponse<ServerAuthorizationTokenResponse> = {
                headers: {},
                body: AUTHENTICATION_RESULT.body,
                status: 200,
            };
            const networkStub = sinon
                .stub(networkInterface, "sendPostRequestAsync")
                .returns(Promise.resolve(mockRes));
            const getThrottlingStub = sinon.stub(cache, "getThrottlingCache");
            const setThrottlingStub = sinon.stub(cache, "setThrottlingCache");
            const removeItemStub = sinon.stub(cache, "removeItem");
            sinon.stub(Date, "now").callsFake(() => 1);

            const res =
                await networkManager.sendPostRequest<ServerAuthorizationTokenResponse>(
                    thumbprint,
                    "tokenEndpoint",
                    options
                );

            sinon.assert.callCount(networkStub, 1);
            sinon.assert.callCount(getThrottlingStub, 1);
            sinon.assert.callCount(setThrottlingStub, 0);
            sinon.assert.callCount(removeItemStub, 0);
            expect(res).toEqual(mockRes);
        });

        it("blocks the request if item is found in the cache", async () => {
            const networkInterface = DEFAULT_NETWORK_IMPLEMENTATION;
            const cache = new MockStorageClass(
                TEST_CONFIG.MSAL_CLIENT_ID,
                mockCrypto,
                new Logger({})
            );
            const networkManager = new NetworkManager(networkInterface, cache);
            const thumbprint: RequestThumbprint = THUMBPRINT;
            const options: NetworkRequestOptions = NETWORK_REQUEST_OPTIONS;
            const mockThrottlingEntity = THROTTLING_ENTITY;
            const networkStub = sinon.stub(
                networkInterface,
                "sendPostRequestAsync"
            );
            const getThrottlingStub = sinon
                .stub(cache, "getThrottlingCache")
                .returns(mockThrottlingEntity);
            const setThrottlingStub = sinon.stub(cache, "setThrottlingCache");
            const removeItemStub = sinon.stub(cache, "removeItem");
            sinon.stub(Date, "now").callsFake(() => 1);

            try {
                await networkManager.sendPostRequest<ServerAuthorizationTokenResponse>(
                    thumbprint,
                    "tokenEndpoint",
                    options
                );
            } catch {}

            sinon.assert.callCount(networkStub, 0);
            sinon.assert.callCount(getThrottlingStub, 1);
            sinon.assert.callCount(setThrottlingStub, 0);
            sinon.assert.callCount(removeItemStub, 0);
            expect(() =>
                ThrottlingUtils.preProcess(cache, thumbprint)
            ).toThrowError(ServerError);
        });

        it("passes request through if expired item in cache", async () => {
            const networkInterface = DEFAULT_NETWORK_IMPLEMENTATION;
            const cache = new MockStorageClass(
                TEST_CONFIG.MSAL_CLIENT_ID,
                mockCrypto,
                new Logger({})
            );
            const networkManager = new NetworkManager(networkInterface, cache);
            const thumbprint: RequestThumbprint = THUMBPRINT;
            const options: NetworkRequestOptions = NETWORK_REQUEST_OPTIONS;
            const mockRes: NetworkResponse<ServerAuthorizationTokenResponse> = {
                headers: {},
                body: AUTHENTICATION_RESULT.body,
                status: 200,
            };
            const mockThrottlingEntity = THROTTLING_ENTITY;
            const networkStub = sinon
                .stub(networkInterface, "sendPostRequestAsync")
                .returns(Promise.resolve(mockRes));
            const getThrottlingStub = sinon
                .stub(cache, "getThrottlingCache")
                .returns(mockThrottlingEntity);
            const setThrottlingStub = sinon.stub(cache, "setThrottlingCache");
            const removeItemStub = sinon.stub(cache, "removeItem");
            sinon.stub(Date, "now").callsFake(() => 10);

            const res =
                await networkManager.sendPostRequest<ServerAuthorizationTokenResponse>(
                    thumbprint,
                    "tokenEndpoint",
                    options
                );

            sinon.assert.callCount(networkStub, 1);
            sinon.assert.callCount(getThrottlingStub, 1);
            sinon.assert.callCount(setThrottlingStub, 0);
            sinon.assert.callCount(removeItemStub, 1);
            expect(res).toEqual(mockRes);
        });

        it("creates cache entry on error", async () => {
            const networkInterface = DEFAULT_NETWORK_IMPLEMENTATION;
            const cache = new MockStorageClass(
                TEST_CONFIG.MSAL_CLIENT_ID,
                mockCrypto,
                new Logger({})
            );
            const networkManager = new NetworkManager(networkInterface, cache);
            const thumbprint: RequestThumbprint = THUMBPRINT;
            const options: NetworkRequestOptions = NETWORK_REQUEST_OPTIONS;
            const mockRes: NetworkResponse<ServerAuthorizationTokenResponse> = {
                headers: {},
                body: AUTHENTICATION_RESULT.body,
                status: 500,
            };
            const networkStub = sinon
                .stub(networkInterface, "sendPostRequestAsync")
                .returns(Promise.resolve(mockRes));
            const getThrottlingStub = sinon.stub(cache, "getThrottlingCache");
            const setThrottlingStub = sinon.stub(cache, "setThrottlingCache");
            const removeItemStub = sinon.stub(cache, "removeItem");
            sinon.stub(Date, "now").callsFake(() => 1);

            const res =
                await networkManager.sendPostRequest<ServerAuthorizationTokenResponse>(
                    thumbprint,
                    "tokenEndpoint",
                    options
                );

            sinon.assert.callCount(networkStub, 1);
            sinon.assert.callCount(getThrottlingStub, 1);
            sinon.assert.callCount(setThrottlingStub, 1);
            sinon.assert.callCount(removeItemStub, 0);
            expect(res).toEqual(mockRes);
        });

        it("throws network error if fetch client fails", (done) => {
            const networkInterface = DEFAULT_NETWORK_IMPLEMENTATION;
            const cache = new MockStorageClass(
                TEST_CONFIG.MSAL_CLIENT_ID,
                mockCrypto,
                new Logger({})
            );
            const networkManager = new NetworkManager(networkInterface, cache);
            const thumbprint: RequestThumbprint = THUMBPRINT;
            const options: NetworkRequestOptions = NETWORK_REQUEST_OPTIONS;

            sinon
                .stub(networkInterface, "sendPostRequestAsync")
                .returns(Promise.reject("Fetch failed"));

            networkManager
                .sendPostRequest<ServerAuthorizationTokenResponse>(
                    thumbprint,
                    "tokenEndpoint",
                    options
                )
                .catch((e) => {
                    expect(e).toBeInstanceOf(ClientAuthError);
                    expect(e.errorCode).toBe(ClientAuthErrorCodes.networkError);
                    done();
                });
        });
    });
});
