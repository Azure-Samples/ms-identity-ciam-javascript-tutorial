/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Add here the endpoints for MS Graph API services you would like to use.
export const GRAPH_CONFIG = {
    GRAPH_ME_ENDPT: "/me",
    GRAPH_MAIL_ENDPT: "/me/messages"
};


export enum IpcMessages {
    SHOW_WELCOME_MESSAGE = "SHOW_WELCOME_MESSAGE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    GET_PROFILE = "GET_PROFILE",
    SET_PROFILE = "SET_PROFILE",
    GET_MAIL = "GET_MAIL",
    SET_MAIL = "SET_MAIL"
}
