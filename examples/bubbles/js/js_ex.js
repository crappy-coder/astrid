(function() {
    var ver_id = "$Id$";
    var userAgent = window.navigator.userAgent.toLowerCase();
    var callbacks = {};
    var system_event_listeners = {};
    var registry = {};
    var mc_callbacks = {};
    var system_version = []
    var device_id = "";

    var platform;
    // For Orbis
    if ("sce" in window.navigator) {
        platform = {
            name: "ORBIS",

            postMessage : function(s) {
                window.navigator.sce.postMessage(s);
            },

            sendMessage : function(s) {
                return window.navigator.sce.sendMessage(s);
            }
        }
    }
    // For Generic browser
    else {
        platform = {
            name: "BROWSER",

            postMessage : function(s) {
                // prompt(s);
            },

            sendMessage : function(s) {
                // return prompt(s);
                return "{}";
            }
        }
    };

    var private = {
        // generate unique ID string
        create_next_guid: (function () {
            var date_in_msec = new Date().valueOf();
            var MAX_SEQ = Math.pow(2, 32);
            var num = 0;
            return function () {
                return date_in_msec + "_" + (num < MAX_SEQ ? num++ : 0);
            };
        })(),

        // call a system process API asynchronously
        call_async: function(api_name, args, callback) {
            var cbid;
            if (typeof(callback) === "function") {
                cbid = private.create_next_guid();
                callbacks[cbid] = callback;
            }
            var s = JSON.stringify({name: api_name, cbid: cbid, args: args});
            platform.postMessage(s);
            return cbid;
        },

        // call a system process API synchronously
        call_sync: function(api_name, args) {
            var s = JSON.stringify({name: api_name, args: args});
            var r = platform.sendMessage(s);
            return JSON.parse(r);
        },

        // kicked by system process:
        // call listeners corresponding to the event type
        do_callback: function(cbid, res) {
            var f = callbacks[cbid];
            delete callbacks[cbid];
            if (f) {
                res.cbid = cbid;
                f(res);
            }
        },

        // kicked by system process:
        // call listeners corresponding to the event type
        send_system_event: function(system_event) {
            var type = system_event.type;
            var listeners = system_event_listeners[type];
            var listener;
            var size;
            var dirty = false;
            var clean_listeners;
            var i;
            if (Array.isArray(listeners)) {
                size = listeners.length;
                // step over all the registered callbacks
                for (i = 0; i < size; ++i) {
                    listener = listeners[i];
                    if (listener) {
                        listener(system_event);
                    } else {
                        dirty = true;
                    }
                }
                // cleanup (push faster than filter or splice)
                // if listener were removed on earlier listener, this will not cleanup on the same frame
                if (dirty && size > 0) {
                    clean_listeners = [];
                    for (i = 0; i < size; i++) {
                        listener = listeners[i];
                        if (listener) {
                            clean_listeners.push(listener);
                        }
                    }
                    system_event_listeners[type] = clean_listeners;
                }
            }
        },
    }

    // Setup onMessage handler which is called if the system process
    // calls WKContextPostMessageToInjectedBundle()
    if (platform.name === "ORBIS") {
        window.navigator.sce.onmessage = function(message_obj) {
            var message = JSON.parse(message_obj.data);
            if (message.type === "callback") {
                private.do_callback(message.cbid, message.res);
            } else if (message.type === "system_event") {
                private.send_system_event(message.event);
            }
        }
    }

    /**
     * @class sce
     **/
    /**
     * @typedef {Object} sce.SyncErrorResult
     * @memberof sce
     * @property {Number} code - Error code. Usually a negative number.
     * @property {String} error - Human readable error description
     * @property {Object} [option] - Optional error info for error dialog.
     * @example {"code":-2131034110,"error":"page not found"}
     */
    /**
     * @typedef {Object} sce.AsyncErrorResult
     * @memberof sce
     * @property {Number} code - Error code. Usually a negative number.
     * @property {String} error - Human readable error description.
     * @property {Object} [option] - Optional error info for error dialog.
     * @property {String} cbid - Callback ID
     * @example {"code":-2131034110,"error":"page not found","cbid":"1415347785193_13"}
     */
    var public =  {
        ver_id: ver_id,

        platform: platform.name,

        /**
         * Abort an asynchronous API call.
         * @function abort
         * @memberof sce
         * @param {Number} - Callback ID of an asynchronous API call.
         * @return null
         */
        abort: function(cbid) {
            if (cbid) {
                private.call_async("abort", { cbid: cbid });
            }
        },

        /**
         * Abort all asynchronous API calls which are currently executing or waiting.
         * @function abortAll
         * @memberof sce
         * @return null
         */
        abortAll: function() {
            for (var cbid in callbacks) {
                private.call_async("abort", { cbid: cbid });
            }
        },

        /**
         * App Notification
         * @typedef {Object} AppNotification
         * @memberof sce
         * @property {String} name - The identification name of notification.
         * @property {Object} data - An object to contain any data for the notification.
         */

        /**
         * Notify system of something
         * @memberof sce
         * @param {sce.AppNotification} app_notification - An AppNotification to be sent to the system
         * @return {String} Callback ID
         */
        appNotifyToSystem: function(app_notification) {
            return private.call_async("appNotifyToSystem", app_notification, null);
        },

        /**
         * Signout a user.
         * (Available only for CAM.
         * See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=47631 bug 47631} for the details)
         * @memberof sce
         * @param {String} account_id - Account ID of the user.
         * @return null
         */
        signout: function(account_id) {
            var an = { name: "signout", data: { account_id: account_id }};
            public.appNotifyToSystem(an);
        },

        /**
         * Terminate the current ShellApp or MiniApp.
         * (See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=6580 bug 6580} for the details)
         * @memberof sce
         * @param {String} status - Exit status.
         * @param {Object} [option] - an object to contain any optional data.
         * @return null
         */
        exit: function(status, option) {
            var an = { name: "exit", data: { status: status, option: option }};
            public.appNotifyToSystem(an);
        },

        /**
         * @deprecated See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=23928 bug 23928} for the details
         * @memberof sce
         */
        bindAccount: function(signin_id, sso_cookie, vsh_login_json, status, p_code) {
            var data = {
                signin_id: signin_id,
                sso_cookie: sso_cookie,
                vsh_login_json: vsh_login_json,
                status: status,
                p_code: p_code
            };
            var an = { name: "bindAccount", data: data };
            public.appNotifyToSystem(an);
        },

        /**
         * Create a file to pass a grief report body data to the Grief Report Plugin
         * @function createGriefReportAttachFile
         * @memberof sce
         * @param {String} body - a grief report body data in JSON format or URL string for the image to be reported.
         * @param {sce.CreateGriefReportAttachFileCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback CreateGriefReportAttachFileCallback
         * @memberof sce
         * @param {sce.CreateGriefReportAttachFileResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} CreateGriefReportAttachFileResult
         * @memberof sce
         * @property {String} name - file name of the created attach file.
         * @property {Number} size - file size of the created attach file in byte.
         * @property {String} cbid - Callback ID
         * @example {"name":"activity_feed.txt","size":1021,"cbid":"1432200381758_14"}
         * @example {"name":"Attach.png","size":58923,"cbid":"1432200381758_14"}
         */
        createGriefReportAttachFile: function(body, callback) {
            return private.call_async("createGriefReportAttachFile", { body: body }, callback);
        },

        /**
         * Create a sub-account. (Available only for CAM.
         * See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=23929 bug 23929} for the details)
         * @memberof sce
         * @param {String} title - A message string to be displayed at the top of screen.
         * @param {String} [locale] - Locale of texts on UI.
         * @return null
         */
        createSubAccount: function(title, locale) {
            var data = {
                title: title
            };
            var an = { name: "createSubAccount", data: data, locale: locale };
            public.appNotifyToSystem(an);
        },

        /**
         * Update profile cache. (available for CAM (VSH1.7) and Swordfish (VSH3.0)
         * See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=30553 bug 30553} for the details)
         * @memberof sce
         * @return null
         */
        updateProfileCache: function() {
            var an = { name: "updateProfileCache", data: "" };
            public.appNotifyToSystem(an);
        },

        /**
         * Aavailabel only for Reg
         * See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=73536 bug 73536} for the details
         * @memberof sce
         */
        setUserProfile: function(avatarUrl, pictureUrl, firstName, middleName, lastName) {
            var data = {
                avatarUrl: avatarUrl,
                pictureUrl: pictureUrl,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName
            };
            var an = { name: "setUserProfile", data: data };
            public.appNotifyToSystem(an);
        },

        /**
         * Check if the enter button is assigned to the circle button.
         * @memberof sce
         * @return {Boolean} True if the enter button is assigned to the circle button.
         */
        enterButtonAssignCircle: function() {
            return private.call_sync("enterButtonAssignCircle");
        },

        /**
         * Get AccessToken. The token may be a cached one if the system has an active token in the cache.
         * @function getAccessToken
         * @memberof sce
         * @param {sce.GetAccessTokenCallback} callback - Callback function
         * @param {String} [page_id] - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Callback ID
         */
        /**
         * @callback GetAccessTokenCallback
         * @memberof sce
         * @param {sce.GetAccessTokenResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetAccessTokenResult
         * @memberof sce
         * @property {String} access_token - Access Token
         * @property {Number} expiration_time - Expiration time in msec since 1970/1/1 00:00:00
         * @property {String} cbid - Callback ID
         * @example {"access_token":"3c03d8ba-7c14-49ee-a40f-2786f9f1beb7","expiration_time":1415349588728,"online_id":"jmwtpg1","cbid":"1415347785193_16"}
         */
        getAccessToken: function(callback, page_id) {
            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            return private.call_async("getAccessToken", args, callback);
        },

        /**
         * Get AccessToken. The system always obtains a brand new token from the server.
         * @memberof sce
         * @param {sce.GetAccessTokenCallback} callback - Callback function
         * @param {String} [page_id] - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Callback ID
         */
        updateAccessToken: function(callback, page_id) {
            var args = { update: true };
            if (page_id) {
                args["page_id"] =  page_id;
            }
            return private.call_async("getAccessToken", args, callback);
        },

        /**
         * Get a Hash value of account ID for the user of the page.
         * @function getAccountIdHash
         * @memberof sce
         * @param {sce.GetAccountIdHashCallback} callback - Callback function
         * @param {String} page_id - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Callback ID
         */
        /**
         * @callback GetAccountIdHashCallback
         * @memberof sce
         * @param {sce.GetAccountIdHashResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetAccountIdHashResult
         * @memberof sce
         * @property {String} value - Account ID Hash
         * @property {String} cbid - Callback ID
         * @example {"value":"b5c477d9c6c0952bc9d6df4780d442aae3fd8db84d1383fbc339a696e766058c","cbid":"1415347785193_14"}
         */
        getAccountIdHash: function(callback, page_id) {
            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            return private.call_async("getAccountIdHash", args, callback);
        },

        /**
         * Get Ad-Clock.
         * @function getAdTime
         * @memberof sce
         * @return {sce.Time}
         */
        /**
         * @typedef {Object} Time
         * @memberof sce
         * @property {Number} msec - Ad-Clock in msec since 1970/1/1 00:00:00.
         * @example {"msec":1415349410087}"
         */
        getAdTime: function() {
            return private.call_sync("getAdTime");
        },

        /**
         * Get AuthCode.
         * @function getAuthCode
         * @memberof sce
         * @param {String} client_id - Client ID
         * @param {String} redirect_url - Redirect URL
         * @param {String} scope - Scope
         * @param {sce.GetAuthCodeCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * Get AuthCode.
         * @function getAuthCode
         * @memberof sce
         * @param {String} page_id - Page ID passed by {@link sce.OnLocationChangeSystemEvent}.
         * @param {String} client_id - Client ID
         * @param {String} redirect_url - Redirect URL
         * @param {String} scope - Scope
         * @param {sce.GetAuthCodeCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetAuthCodeCallback
         * @memberof sce
         * @param {sce.GetAuthCodeResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetAuthCodeResult
         * @memberof sce
         * @property {String} auth_code - Auth Code
         * @property {String} cbid - Callback ID
         * @example {"auth_code":"SQxSVO", "cbid":"1415347785193_14"}
         */
        getAuthCode: function() {
            var args;
            var callback;
            if (arguments.length === 4) {
                args = {client_id: arguments[0], redirect_uri: arguments[1], scope: arguments[2]};
                callback = arguments[3];
            }
            else {
                args = {page_id: arguments[0], client_id: arguments[1], redirect_uri: arguments[2], scope: arguments[3]};
                callback = arguments[4];
            }
            return private.call_async("getAuthCode", args, callback);
        },

        /**
         * Get Base URL.
         * @function getBaseUrl
         * @memberof sce
         * @param {String} api_group - API Group <br>
         * (e.g. "regcam", "socialNetwork", "groupMessaging", "systemMessage", "notificationList", "trophy", "commerce",
         * "userProfile", "pushNotification", "liveItem", "sessionInvitation", "gameCustomData", "activityFeed",ID "onlineRecord",
         * "griefReport", "entitlement", "psAppNotification", "tss", "friendFinder", "wordFilter", "ucrp", "scoreRanking", "tus",
         * "tusManagement", "storeCatalog", etc)
         * @param {sce.GetBaseUrlCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetBaseUrlCallback
         * @memberof sce
         * @param {sce.GetBaseUrlResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetBaseUrlResult
         * @memberof sce
         * @property {String} base_url - Base URL
         * @property {String} cbid - Callback ID
         * @example {base_url: "https://commerce.api.np.km.playstation.net/commerce/api", cbid:"1415347785193_14"}
         */
        getBaseUrl: function(api_group, callback) {
            var args = {api_group: api_group};
            return private.call_async("getBaseUrl", args, callback);
        },

        /**
         * Get Closed Caption Settings.
         * @function getCcSettings
         * @memberof sce
         * @param {sce.GetCcSettingsCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetCcSettingsCallback
         * @memberof sce
         * @param {sce.GetCcSettingsResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetCcSettingsResult
         * @memberof sce
         * @property {Boolean} enable_cc - true if closed caption is enable.
         * @property {Boolean} content_specifi - true if cc is rendered as specified by content.
         * @property {Number} font_type - font type number.
         * @property {Number} char_color - characters color number.
         * @property {Number} char_opacity - characters opacity in % number.
         * @property {Number} char_size - characters size in % number.
         * @property {Number} char_edge - characters edge type number.
         * @property {Number} char_edge_color - characters edge color number.
         * @property {Number} char_bg_color - characters background color number.
         * @property {Number} char_bg_opacity - characters background opacity in % number.
         * @property {Number} window_color - window color number.
         * @property {Number} window_opacity - window opacity in % number
         * @property {String} cbid - Callback ID.
         * @example {
         *    enable_cc: false,
         *    content_specifi: true,
         *    char_color: 131586,
         *    char_opacity: 100,
         *    char_size: 100,
         *    font_type: 2,
         *    char_edge: 0,
         *    char_edge_color: 0,
         *    char_bg_color: 0,
         *    char_bg_opacity: 100,
         *    window_color: 131586,
         *    window_opacity: 0,
         *    cbid: "1417095537002_10"
         * }
         */
        getCcSettings: function(callback) {
            return private.call_async("getCcSettings", null, callback);
        },

        /**
         * Get Debug Network Time.
         * @function getDebugNetworkTime
         * @memberof sce
         * @return {sce.Time|sce.SyncErrorResult} Callback ID
         */
        getDebugNetworkTime: function() {
            return private.call_sync("getDebugNetworkTime");
        },

        /**
         * Get Device ID.
         * @function getDeviceId
         * @memberof sce
         * @return {String} Device ID.
         * @example "22fa2283-75c0-bc1d-e442-df27590ad2e1"
         */
        getDeviceId: function() {
            return device_id;
        },

        /**
         * Get Disc Info.<br>
         * A disc can contain more than one game or content.
         * If no param is specified, an array of info for all contents on the inserted disc are returned
         * @function getDiscInfo
         * @param {String} [title_id] - Title ID (e.g. "NPXS29017")
         * @memberof sce
         * @return {sce.GetDiscInfoResult|sce.GetDiscInfoResult[]|sce.SyncErrorResult} Callback ID
         */
        /**
         * @typedef {Object} GetDiscInfoResult
         * @memberof sce
         * @property {String} title_id - Title ID (e.g. "NPXS29017").
         * @property {String} disc_type - Disc Type<br>
         * ("corrupted", "game", "media", "none", "unsupported")
         * @property {String} disc_image - Disc Image<br>
         * ("bd", "bddvd", "corrupted", "dve", "none", "othergame", "ps3", "ps4")
         * @example {title_id: "NPXS29017", disc_type: "game", disc_image: "ps4"}
         */
        getDiscInfo: function(title_id) {
            var args;
            if (title_id) {
                args = {title_id: title_id};
            }
            return private.call_sync("getDiscInfo", args);
        },

        /**
         * Get Download Task Info.<br>
         * @memberof sce
         * @function getDownloadTaskInfo
         * @param {sce.GetDownloadTaskInfoCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetDownloadTaskInfoCallback
         * @memberof sce
         * @param {sce.GetDownloadTaskInfoResult|sce.AsyncErrorResult} res

         */
        /**
         * @typedef {Object} GetDownloadTaskInfoResult
         * @memberof sce
         * @property {sce.DownloadTaskInfo[]} tasks - Task Info
         * @property {String} cbid - Callback ID
         * @example  {
         *     tasks: [
         *      {
         *          content_title: "NP Commerce Sample Internal",
         *          sub_type: "Game",
         *          state: "Stop",
         *          run_state: "Download",
         *          theme: false,
         *          paused: true,
         *          pushed: false,
         *          preorder: false
         *      }
         *    ],
         *    cbid: "1417595579338_24"
         * }
         */
        /**
         * @typedef {Object} DownloadTaskInfo
         * @memberof sce
         * @property {String} content_title - Content title
         * @property {String} sub_type: - Content type ("Game")
         * @property {String} run_state: - Task Run State ("Stop", "Ready", "Run")
         * @property {Boolean} theme - true if the content is a theme
         * @property {Boolean} paused - true if the task is paused
         * @property {Boolean} pushed - true if the content is a gift
         * @property {Boolean} preorder - true if the content is a preorder
         * @example  {
         *    content_title: "NP Commerce Sample Internal",
         *    sub_type: "Game",
         *    state: "Stop",
         *    run_state: "Download",
         *    theme: false,
         *    paused: true,
         *    pushed: false,
         *    preorder: false
         * }
         */
        getDownloadTaskInfo : function(callback)
        {
            return private.call_async("getDownloadTaskInfo", null, callback);
        },

        /**
         * Get Entitlements for Community Creation.
         * @memberof sce
         * @function getEntitlementsForCommunityCreation
         * @param {sce.GetEntitlementsForCommunityCreationCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetEntitlementsForCommunityCreationCallback
         * @memberof sce
         * @param {sce.GetEntitlementsForCommunityCreationResult|sce.AsyncErrorResult} res

         */
        /**
         * @typedef {Object} GetEntitlementsForCommunityCreationResult
         * @memberof sce
         * @property {sce.EntitlementInfo[]} entitlements - Entitlement Info
         * @property {String} cbid - Callback ID
         * @example  {
         *   entitlements: [
         *      {
         *         id: "UP0082-CUSA00288_00-SIMPLESHOOTINGAM",
         *         name: "SIMPLE SHOOTING GAME",
         *         installed: true
         *      },
         *      {
         *         id: "UP9000-EXDG10039_00-DEMOPROD00000001",
         *         name: "UP9000-EXDG10039_00-DEMOPROD00000001",
         *         installed: true
         *      }
         *    ],
         *    cbid: "1417595579338_24"
         * }
         */
        /**
         * @typedef {Object} EntitlementInfo
         * @memberof sce
         * @property {String} id - Entitlement ID.
         * @property {String} name - Entitlement Name.
         * @property {Boolean} installed - true if the content is installed.
         * @example  {
         *    id: "UP0082-CUSA00288_00-SIMPLESHOOTINGAM",
         *    name: "SIMPLE SHOOTING GAME",
         *    installed: true
         * }
         */
        getEntitlementsForCommunityCreation: function(args, callback) {
            if (typeof(args) !== "object") {
                args = {};
            }
            return private.call_async("getEntitlementsForCommunityCreation", args, callback);
        },

        /**
         * Get Last Played Game
         * @memberof sce
         * @function getLastPlayedGame
         * @param {sce.GetLastPlayedGameCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetLastPlayedGameCallback
         * @memberof sce
         * @param {sce.GetLastPlayedGameResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetLastPlayedGameResult
         * @memberof sce
         * @property {String} [title_id] - Title ID which has been played most recently by the current user on this PS4.
         * @property {String} cbid - Callback ID
         * @example  { title_id:"NPXS29017_00", cbid:"1419485110338_88" }
         */
        getLastPlayedGame: function(callback) {
            return private.call_async("getLastPlayedGame", null, callback);
        },

        /**
         * Get Launched App List
         * @memberof sce
         * @function getLaunchedAppList
         * @return {sce.GetLaunchedAppListResult[]|sce.SyncErrorResult} result
         */
        /**
         * @typedef {Object} GetLaunchedAppListResult
         * @memberof sce
         * @property {String} title_id - Title ID which has been played most recently by the current user on this PS4.
         * @property {String} user_id - Callback ID
         */
        getLaunchedAppList: function() {
            return private.call_sync("getLaunchedAppList");
        },

        /**
         * Get Location URL<br>
         * Return the URL string which was passed by the last {@link sce.OnLocationChangeSystemEvent}.
         * @memberof sce
         * @function getLocationUrl
         * @return {String|sce.SyncErrorResult} URL
         */
        getLocationUrl: function() {
            return private.call_sync("getLocationUrl");
        },

        /**
         * Get Login Start Time for Bug73077<br>
         * See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=73077 bug 73077} for the details)
         * @memberof sce
         * @function getLoginStartTimeForBug73077
         * @return {Number|sce.SyncErrorResult} UTC time when the login started in msec since 1970/1/1 00:00:00.
         */
        getLoginStartTimeForBug73077: function() {
            return private.call_sync("getLoginStartTime");
        },

        /**
         * Get Installed Size
         * @memberof sce
         * @function getInstalledSize
         * @param {String} title_id - Title ID.
         * @param {sce.GetInstalledSizeCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetInstalledSizeCallback
         * @memberof sce
         * @param {sce.GetInstalledSizeResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetInstalledSizeResult
         * @memberof sce
         * @property {String} size - Total size in bytes of installed materials for the specified title, which is the same value
         *  as the 'Size' shows in the 'Infomation' of the option menu for the title on the content launcher or the Library.
         * @property {String} cbid - Callback ID
         * @example  { size: 19169280, cbid:"1419485110338_88" }
         */
        getInstalledSize: function(title_id, callback) {
            var args = {title_id: title_id};
            return private.call_async("getInstalledSize", args, callback);
        },

        /**
         * Get Open PS ID<br>
         * This API is available only from Login Manager context.
         * (See {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=59683 bug 59683} for the details)
         * @memberof sce
         * @function getOpenPsId
         * @return {GetOpenPsIdResult|sce.SyncErrorResult} result
         */
        /**
         * @typedef {Object} GetOpenPsIdResult
         * @memberof sce
         * @property {String} id - Open PS ID.
         */
        getOpenPsId: function() {
            return private.call_sync("getOpenPsId");
        },

        /**
         * Get Parental Control Info
         * @memberof sce
         * @function getParentalControlInfo
         * @param {String} page_id - Page ID passed by {@link sce.OnLocationChangeSystemEvent}.
         * @param {sce.GetParentalControlInfo} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetParentalControlInfo
         * @memberof sce
         * @param {sce.GetParentalControlResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetParentalControlResult
         * @memberof sce
         * @property {Boolean} chat_restriction - True if the Chat/Message setting for the user is 'Block'.
         * @property {Boolean} content_restriction - True if the Content Restriction setting for the user is 'On'.
         * @property {Boolean} ugc_restriction - True if the User-Generated Media setting for the user is 'Block'.
         * @property {String} cbid - Callback ID
         * @example  { chat_restriction: false, content_restriction: false, ugc_restriction: false, cbid: "1419576748247_36" }
         */
        getParentalControlInfo: function(page_id, callback) {
            return private.call_async("getParentalControlInfo", { page_id: page_id }, callback);
        },

        /**
         * Get Telemetry Timings (VSH3.00)
         * @memberof sce
         * @function getTelemetryTimings
         * @param {sce.GetTelemetryTimingsCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetTelemetryTimingsCallback
         * @memberof sce
         * @param {sce.GetTelemetryTimingsResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetTelemetryTimingsResult
         * @memberof sce
         * @property {Number} login - Foreground user's last login time in msec since 1970/1/1 00:00:00 UTC
         * @property {Number} signin - Foreground user's last signin time in msec since 1970/1/1 00:00:00 UTC<br>
         * 0 means that the user has never signed in since the PS4 is booted.
         * @property {Number} userChanged - The last time when the user became the foreground user in msec since 1970/1/1 00:00:00 UTC<br>
         * @property {String} cbid - Callback ID
         * @example  {
         *   signin: 1434703927954,
         *   login: 1434703819680,
         *   userChanged: 1434703978336,
         *   cbid: "1434703981292_12"
         * }
         */
        getTelemetryTimings: function(callback) {
            return private.call_async("getTelemetryTimings", null, callback);
        },

        /**
         * Get Theme Info<br>
         * {@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=70144 bug 70144}
         * @memberof sce
         * @function getThemeInfo
         * @param {sce.GetThemeInfoCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetThemeInfoCallback
         * @memberof sce
         * @param {sce.GetThemeInfoResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetThemeInfoResult
         * @memberof sce
         * @property {Number[]} focus_color - Focus color. [ r, g, b, a ]
         * @property {String} cbid - Callback ID
         * @example  { focus_color: [0, 0.7294118, 1, 1], cbid: "1419579748237_18" }
         */
        getThemeInfo: function(callback) {
            return private.call_async("getThemeInfo", null, callback);
        },

        /**
         * Get Title Token
         * @memberof sce
         * @function getTitleToken
         * @param {sce.GetTitleTokenCallback} callback - Callback function
         * @param {String} [page_id] - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Callback ID
         */
        /**
         * @callback GetTitleTokenCallback
         * @memberof sce
         * @param {sce.GetTitleTokenResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetTitleTokenResult
         * @memberof sce
         * @property {String} title_id - NP Title ID
         * @property {String} title_token - NP Title Token
         * @property {Number} expiration_time - Expiration time in msec since 1970/1/1 00:00:00 UTC
         * @property {String} cbid - Callback ID
         * @example  {
         *     title_id: "NPXS29017_00",
         *     title_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxIn0.eyJleHAiOjE0MjA2OTgyNzYsInRva2VuVmVyc2lvbiI6MCwibnBFbnYiOiJlMS1ucCIsIm9ubGluZUlkIjoiam13dHBnMSIsImFwcENsYXNzIjoiUHNDb25zb2xlQXBwIiwibnBUaXRsZUlkIjoiTlBYUzI5MDE3XzAwIn0.oA8euJLR_7Z4BPyI8FxHWjB1gNoZXdStNwdy0HBJaoUbmh4mNK8fkByopg3TNwlhM7_fwUt-rPt9OxXgn3iTFYNcUy5MS2FeJwGwbVAArv6lwEEjVYiNmJhb15DL7On6l6mKv5JaEP67r5TymF6XZ2VJ4i1fvN0xeacvknrbNFcVqV49V9vbUH7Fvc8xE-OvexeES2Ltf62guSYcZG8rQ9uYTu8XOw7qu5Pw7YzCCK8XYKrkF5AKQUTi-VkU9PIwwPWcgxEuIZAHrMG9cBqY7G_zP1fW86IazVPlC_6agOaSsmmjBR3Vm0D7rL7aZ-0LQmRTcHhyRtS9QR6PwSMM7A",
         *     expiration_time: 63556295076000000,
         *     cbid: "1420544156982_352"
         * }
         */
        getTitleToken: function(callback, page_id) {
            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            return private.call_async("getTitleToken", args, callback);
        },

        /**
         * Get User Info List (VSH2.50)
         * @memberof sce
         * @function getUserInfoList
         * @param {sce.GetUserInfoListCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetUserInfoListCallback
         * @memberof sce
         * @param {sce.GetUserInfoListResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetUserInfoListResult
         * @memberof sce
         * @property {sce.UserInfo[]} users - User Info List.  The items are sorted in descendant order of login_oder (VSH2.50 r80852).
         * @property {String} cbid - Callback ID
         * @example  {
         *    "users": [
         *     {
         *       user_id: 268435457,
         *       online_id: "jmwtpg1",
         *       country_code: "us",
         *       np_env: "e1-np",
         *       login: true,
         *       signin: true,
         *       login_order: 132
         *     },
         *     {
         *       user_id: 268435459,
         *       online_id: "s3usosamu",
         *       country_code: "us",
         *       np_env: "e1-np",
         *       login: false,
         *       signin: false,
         *       login_order: 131
         *     },
         *     {
         *       user_id: 268435459,
         *       online_id: "osamuusm",
         *       country_code: "us",
         *       np_env: "e1-np",
         *       login: false,
         *       signin: false,
         *       login_order: 92
         *     }
         *    ],
         *    cbid: "1417595579338_24"
         * }
         */
        /**
         * @typedef {Object} UserInfo
         * @memberof sce
         * @property {Number} user_id - User ID (VSH2.50 r80852)
         * @property {String} online_id - Online ID
         * @property {String} country_code - Country Code (e.g. "us", "jp", etc.)
         * @property {String} np_env - NP environment (e.g. "np", "e1-np", etc.)
         * @property {Boolean} login - true if the user is logged in.
         * @property {Boolean} signin - true if the user is signed in.
         * @property {Number} login_order - Login order number. The most recent login gains the biggest number. (vsh 2.50 r80852)
         * @example  {
         *      user_id: 268435457,
         *      online_id: "jmwtpg1",
         *      country_code: "us",
         *      np_env: "e1-np",
         *      login: true,
         *      signin: true,
         *      login_order: 132
         * }
         */
        getUserInfoList: function(callback) {
            return private.call_async("getUserInfoList", null, callback);
        },

        /**
         * Get Service IDs
         * @memberof sce
         * @function getServiceIds
         * @param {String} service_name - Service Name (= "inGameCommerce")
         * @param {string} title_id - NP Title ID
         * @param {sce.GetServiceIdsCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @callback GetServiceIdsCallback
         * @memberof sce
         * @param {sce.GetServiceIdsResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetServiceIdsResult
         * @memberof sce
         * @property {String[]} service_ids - Array of service ID strings.
         * @property {String} cbid - Callback ID
         * @example { service_ids: ["JP9200-CUSA01000_00"], cbid: "1420615666395_6" }
         */
        getServiceIds: function(service_name, title_id, callback) {
            var args = { service_name: service_name, title_id: title_id };
            return private.call_async("getServiceIds", args, callback);
        },

        /**
         * Get Signin ID (async version VSH2.50)
         * @memberof sce
         * @function getSigninId
         * @param {sce.GetSigninIdCallback} callback - Callback function
         * @param {String} [page_id] - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Callback ID
         */
        /**
         * @callback GetSigninIdCallback
         * @memberof sce
         * @param {sce.GetSigninIdResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetSigninIdResult
         * @memberof sce
         * @property {String} signin_id - Signin ID.
         * @example  { signin_id: "oudagawa@gmail.com", cbid: "1417595579338_24" }
         */
        /**
         * Get Signin ID (sync version)
         * @memberof sce
         * @function getSigninId
         * @param {String} [page_id] - Page ID passed by {@link sce.OnLocationChangeSystemEvent}. The foreground user is referred if not specified.
         * @return {String} Signin ID
         */
        getSigninId: function(arg1, arg2) {
            var callback = null;
            if (typeof(arg1) === "function") {
                callback = arg1;
            }
            else if (typeof(arg2) === "function") {
                callback = arg2;
            }
            var page_id = null;
            if (typeof(arg1) === "string") {
                page_id = arg1;
            }
            else if (typeof(arg2) === "string") {
                page_id = arg2;
            }

            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            if (callback) {
                return private.call_async("getSigninId", args, callback);
            }
            else {
                return private.call_sync("getSigninId", args);
            }
        },

        getNatInfo: function(callback) {
            return private.call_async("getNatInfo", null, callback);
        },

        /**
         * Get Network Time.
         * @function getNetworkTime
         * @memberof sce
         * @return {sce.Time|sce.SyncErrorResult} Callback ID
         */
        getNetworkTime: function() {
            return private.call_sync("getNetworkTime");
        },

        REMOTE_PLAY_STATUS_WAITING : 0,
        REMOTE_PLAY_STATUS_RUNNING : 1,
        getRemotePlayStatus : function() {
            return private.call_sync("getRemotePlayStatus");
        },

        isCloudClientAutoStartAlertExist : function() {
            return private.call_sync("isCloudClientAutoStartAlertExist");
        },

        isRemotePlaying : function() {
            return private.call_sync("isRemotePlaying");
        },

        isGuestUser : function(page_id) {
            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            return private.call_sync("isGuestUser", args);
        },

        isLiveAreaFocused : function() {
            return private.call_sync("isLiveAreaFocused");
        },

        isSignedIn : function(id) {
            var args;
            if (id) {
                if (typeof(id) === "number") {
                    args = {user_id: id};
                }
                else {
                    args = {page_id: id};
                }
            }
            return private.call_sync("isSignedIn", args);
        },

        isSubaccount : function(callback) {
            return private.call_async("isSubaccount", null, callback);
        },

        joinPlay : function(title_id, session_id, callback) {
            var args = {title_id: title_id, session_id: session_id};
            return private.call_async("joinPlay", args, callback);
        },

        killApp : function(title_id, callback) {
            var args = {title_id: title_id};
            return private.call_async("killApp", args, callback);
        },

        logout : function(id) {
            var args;
            if (id) {
                if (typeof(id) === "number") {
                    args = {user_id: id};
                }
                else {
                    args = {page_id: id};
                }
            }
            return private.call_sync("logout", args);
        },

        launchApp : function(uri, callback) {
            if (typeof(callback) === "function") {
                cbid = private.create_next_guid();
                callbacks[cbid] = callback;
                var args = { uri: uri, cbid: cbid };
                var res = private.call_sync("launchApp", args);
                if ("error" in res) {
                    private.do_callback(cbid, res);
                }
            }
            else {
                window.location.href = uri;
            }
        },

        /**
         * Launch Application Asynchronously (Available only for Reg).
         * @function launchAppAsync
         * @memberof sce
         * @param {String} uri - URI for application to be launched.
         * @param {String} [locale] - Locale of texts on UI.
         */
        launchAppAsync : function(uri, locale) {
            var an = { name: "launchAppAsync", data: { uri: uri, locale: locale } };
            public.appNotifyToSystem(an);
        },

        launchModalBrowser : function(uri, callback) {
            public.launchApp("psmodalwebbrowser:load?address=False&close=True&parental=False&signup=False&url="
                + encodeURIComponent(uri),
                callback);
        },

        logClickThrough: function(data) {
            var args;
            var call;
            if (system_version[0] >= 2) {
                args = { data: { LogName: "PS4_ClickThrough", LogData: data } };
                call = private.call_async;
            }
            else {
                args = { data: data };
                call = private.call_sync;
            }
            return call("logClickThrough", args);
        },

        logImpresssion: function(data) {
            if (system_version[0] >= 2) {
                var args = { data: { LogName: "PS4_Impression", LogData: data } };
                return private.call_async("logClickThrough", args);
            }
        },

        logSystemLogger: function(data) {
            if (system_version[0] >= 2) {
                var args = { data: data };
                return private.call_async("logClickThrough", args);
            }
        },

        /**
         * Add System Event Listener.
         * @function addSystemEvent
         * @memberof sce
         * @param {String} type - System Event Type Name.
         * @param {sce.SystemEventLister} listener - System Event Listener.
         * @return null
         */
        /**
         * @callback SystemEventLister
         * @memberof sce
         * @param {sce.SystemEvent|sce.OnLocationChangeSystemEvent|sce.PushSystemEvent|sce.OnNpStateChangedSystemEvent} system_event - System Event.
         */
        /**
         * @typedef {Object} SystemEvent
         * @memberof sce
         * @property {String} type - System Event Type Name.
         */
        /**
         * @typedef {Object} OnLocationChangeSystemEvent
         * The OnLocationChangeSystemEvent is a request to open a new location.
         * @memberof sce
         * @property {String} type - System Event Type Name ("onLocationChange").
         * @property {String} param - URI string to specify the location to be open.
         * @property {String} page_id - ID for the page.  Pages are bound to instances of application or plugins.
         * @property {String} session_id - ID for the session which starts with this location change request.
         * @property {Object} [option] - Additional information.
         * @example {
         *    type: "onLocationChange",
         *    param: "pslivedetail:browse?title_id=NPXS29017&entitlement_id=IV0002-NPXS29017_00-APP0000000000000",
         *    page_id: "4",
         *    session_id: "11",
         *    option: {"user_id":268435460}
         * }
         */
        /**
         * @typedef {Object} PushSystemEvent
         * (VSH2.50)
         * @memberof sce
         * @property {String} type - System Event Type Name ("push_event").
         * @property {String} push_event_type - Push Event Type.
         * <table border="1">
         * <tr><th>Push Event Type</th>                                    <th>Description</th></tr>
         * <tr><td>"np:service:friendlist:friend"                          </td><td>A friend was added or removed from the friends list of the current user.</td></tr>
         * <tr><td>"np:service:friendlist:personalDetailSharing:requesting"</td><td>The current user sent a friend request to a user.</td></tr>
         * <tr><td>"np:service:friendlist:requested"                       </td><td>A user sent a friend request to the current user.</td></tr>
         * <tr><td>"np:service:blocklist"                                  </td><td>A user was added to, or deleted from, the user’s block list.</td></tr>
         * <tr><td>"np:service:presence:onlineStatus"                      </td><td>The online status in the presence information was updated.</td></tr>
         * <tr><td>"np:service:presence:gameTitleInfo"                     </td><td>The game title information in the presence information was updated.</td></tr>
         * <tr><td>"np:service:presence:gameStatus"                        </td><td>The status string related to gameplay in the presence information was updated.</td></tr>
         * <tr><td>"np:service:presence:system:gameTitleInfo"              </td><td>The game title information in the presence information was updated.</td></tr>
         * <tr><td>"np:service:presence:system:gameStatus"                 </td><td>The status string related to gameplay in the presence information was updated.</td></tr>
         * <tr><td>"np:service:friendlist:personalDetailSharing:shared"    </td><td>A true name request from/to the current user was approved.</td></tr>
         * <tr><td>"np:service:friendlist:personalDetailSharing:requesting"</td><td>The current user sent a true name request to a user</td></tr>
         * <tr><td>"np:service:friendlist:personalDetailSharing:requested" </td><td>A user sent a true name request to the current user</td></tr>
         * </table>
         * @property {String} to_online_id - Online ID of the user to who the push event was sent
         * @property {String} [from_online_id] - Online ID of the user from who the push event was sent
         * @property {Object} [data] - Additional information.
         * @example {
         *   type: "push_event",
         *   push_event_type: "np:service:presence:onlineStatus",
         *   to_online_id: "jmwtpg1",
         *   from_online_id: "osamujp"
         * }
         *
         * @example {
         *   type: "push_event",
         *   push_event_type: "np:service:friendlist:requested",
         *   to_online_id: "jmwtpg1",
         *   data: {
         *   serverInternal: {
         *       type: "new"
         *     }
         *   }
         * }
         */
        /**
         * @typedef {Object} OnNpStateChangedSystemEvent
         * @memberof sce
         * @property {String} type - System Event Type Name ("onNpStateChanged").
         * @property {Number} user_id - Local user ID of the account.
         * @property {Boolean} signed_in - true if the user become signed in.
         * @property {String} online_id - Online ID of the account.
         * @example {
         *    type: "onNpStateChanged",
         *    user_id: 268435457,
         *    signed_in: true,
         *    online_id: "jmwtpg1"
         * }
         */
        addSystemEventListener: function(type, listener) {
            var listeners = system_event_listeners[type];
            if (Array.isArray(listeners)) {
                if (listeners.indexOf(listener) < 0) {
                    listeners.push(listener);
                }
            } else {
                system_event_listeners[type] = [ listener ];
            }
        },

        // remove an event listener for the event type
        removeSystemEventListener: function(type, listener) {
            var listeners = system_event_listeners[type];
            if (Array.isArray(listeners)) {
                var i = listeners.indexOf(listener);
                if (0 <= i && i < listeners.length) {
                    // mark for removal
                    listeners[i] = null;
                }
            }
        },

        log: function(str) {
            var an = { name: "log", data: { str: str }};
            public.appNotifyToSystem(an);
        },

        didFinishLoading: function(load_id) {
            var an = { name: "didFinishLoading", data: { load_id: load_id }};
            public.appNotifyToSystem(an);
        },

        didFinishSessionReady: function(session_id) {
            private.session_id = session_id;
            var an = { name: "didFinishSessionReady", data: { session_id: session_id }};
            public.appNotifyToSystem(an);
        },
        didFinishDisplayReady: function(session_id) {
            private.session_id = session_id;
            var an = { name: "didFinishDisplayReady", data: { session_id: session_id }};
            public.appNotifyToSystem(an);
        },
        didFinishLocationChange: function(session_id) {
            private.session_id = session_id;
            var an = { name: "didFinishLocationChange", data: { session_id: session_id }};
            public.appNotifyToSystem(an);
        },

        didPurchasePlusMembership: function(page_id) {
            var an = { name: "didPurchasePlusMembership", data: { page_id: page_id }};
            public.appNotifyToSystem(an);
        },

        setFrameProperty: function(enter, back, triangle, square, options, title, showUser, up, down, l1, r1) {
            var info = { enter: enter, back: back, triangle: triangle, square: square, options: options, title: title, showUser: showUser, up: up, down: down, l1: l1, r1: r1 };
            public.setFrameInfo(info);
        },

        setFrameInfo: function(info) {
            var an = { name: "setFrameProperty", data: { session_id: private.session_id, info: info }};
            public.appNotifyToSystem(an);
        },

        setSessionProperty: function(props) {
            var an = { name: "setSessionProperty", data: { session_id: private.session_id, props: props }};
            public.appNotifyToSystem(an);
        },

        navigateToGoHome : function() {
            var an = { name: "navigateToGoHome", data: { session_id: private.session_id }};
            public.appNotifyToSystem(an);
        },

        notifyMaintenance : function() {
            var an = { name: "notifyMaintenance", data: { session_id: private.session_id }};
            public.appNotifyToSystem(an);
        },

        notifySystemLogger : function(info) {
            var an = { name: "notifySystemLogger", data: { session_id: private.session_id, info: info }};
            public.appNotifyToSystem(an);
        },

        openErrorDialog: function(code, message, close_id) {
            var args = { code: code, message: message };
            public.openConfirmDialog(args, close_id);
        },

        closeErrorDialog: function(close_id) {
            public.closeConfirmDialog(close_id);
        },

        /**
         * Open confirm dialog
         * @function openConfirmDialog
         * @memberof sce
         * @param {sce.ConfirmDialogArgs} args - Confirm dialog details.
         * @param {String} close_id - ID to be specified as an parameter for {@link sce.closeConfirmDialog}.
         */
        /**
         * @typedef {Object} ConfirmDialogArgs
         * @memberof sce
         * @property {String} [code|error_code] - Error Code.
         * @property {String} [message] - Error Message.
         * @property {String} [title] - Title on the top of screen..
         * @property {String} [ok] - Text on the positive button.
         * @property {String} [cancel] - Text on the negative button.
         * @property {String} [buttonOrientation] - Button layout ("vertical" or "horizontal").
         * @property {String} [backgroundColor] - Background Color ("#rrggbb" or "#rrggbbaa").
         * @property {String} [openSound] - Open Sound Effect ("normal" or "none").
         * @property {String[]} [messageArgs] - Array of strings which fill the %1, %2,... in message. (VSH2.5)
         * @property {String} [positiveActionUri] - URI string which is executed when ok button is pressed. (VSH2.5)
         *
         * @example {
         *    code: -2137456583,
         *    messageArgs: ["NP Commerce Sample", "27.43MB"]
         *}
         */
        openConfirmDialog: function(args, close_id) {
            var an = { name: "openErrorDialog", data: { session_id: private.session_id, args: args, close_id: close_id }};
            public.appNotifyToSystem(an);
        },

        /**
         * Close confirm dialog
         * @function closeConfirmDialog
         * @memberof sce
         * @param {String} close_id - ID specified when {@link sce.openConfirmDialog} was called.
         */
        closeConfirmDialog: function(close_id) {
            var an = { name: "closeErrorDialog", data: { session_id: private.session_id, close_id: close_id }};
            public.appNotifyToSystem(an);
        },

        /**
         * Open friend selector dialog (VSH3.00)
         * @memberof sce
         * @function openFriendSelectorDialog
         * @param {sce.FriendSelectorDialogArgs} args - Friend selector dialog parameters
         * @param {sce.FriendSelectorDialogCallback} callback - Callback function
         * @return {String} Callback ID
         */
        /**
         * @typedef {Object} FriendSelectorDialogArgs
         * @memberof sce
         * @property {Number} [max_user] - Maximum number of users to be selected. (100 if not specified)
         * @property {String} [header] - Title text on the top of dialog. ("Select Players" if not specified)
         * @property {String} [done_label] - Text on the Done button. (Localized "Done" if not specified)
         * @property {String} [back_label] - Text on the footer to explain the Back button (Localized "Back" if not specified)
         * @property {Boolean} [force_selection] - true disables the Done button unless more than one user is selected. (false if not specified)
         * @example { max_user: 100, header: "Invite Friends" }
         */
        /**
         * @callback FriendSelectorDialogCallback
         * @memberof sce
         * @param {sce.FriendSelectorDialogResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} FriendSelectorDialogResult
         * @memberof sce
         * @property {String[]} selected - Array of online ID strings or null if the dialog is closed by not user but program.
         * @property {String} cbid - Callback ID
         * @example { selected: ["koh","jpc","osamu"], cbid: "1420615666395_6" }
         */
        openFriendSelectorDialog: function(args, callback) {
            var cbid;
            if (typeof(callback) === "function") {
                cbid = private.create_next_guid();
                callbacks[cbid] = callback;
            }
            if (typeof(args) !== "object") {
                args = {};
            }
            args.cbid = cbid;
            var res = private.call_sync("openFriendSelectorDialog", args);
            if (res && "error" in res) {
                private.do_callback(cbid, res);
                return null;
            }
            return cbid; // useless so far.
        },

        /**
         * Close friend selector dialog (VSH3.00)
         * @memberof sce
         * @function closeFriendSelectorDialog
         */
        closeFriendSelectorDialog: function() {
            return private.call_sync("closeFriendSelectorDialog");
        },

        openOptionMenu: function(items, callback) {
            var cbid = private.create_next_guid();
            callbacks[cbid] = function(r) {
                if (typeof(callback) === "function") {
                    callback(r);
                }
                if (r && 0 <= r.index && r.index < items.length) {
                    var cb = items[r.index].callback;
                    if (typeof(cb) === "function") {
                        cb(r);
                    }
                }
            };
            var args = { items : items, cbid : cbid };
            var res = private.call_sync("openOptionMenu", args);
            if (res && "error" in res) {
                private.do_callback(cbid, res);
                return null;
            }
            return cbid; // useless so far.
        },

        closeOptionMenu: function() {
            return private.call_sync("closeOptionMenu");
        },

        /**
         * Open password dialog
         * @function openPasswordDialog
         * @memberof sce
         * @param {String} page_id - Page ID. The foreground user is referred if null is specified.
         * @param {sce.PasswordDialogResultCallback} callback - Callback function.
         * @param {String} [mode] - Dialog mode. ("store" : sign-in ID is not changeable)
         * @param {String} [locale] - Locale of texts on UI.
         */
        /**
         * @callback PasswordDialogResultCallback
         * @memberof sce
         * @param {sce.PasswordDialogResult} res
         */
        /**
         * @typedef {Object} PasswordDialogResult
         * @memberof sce
         * @property {String} status - "ok" or "cancel".
         * @property {String} [string] - input string.
         *
         * @example {
         *    status: "ok",
         *    string: "abcd1234"
         *}
         */
        openPasswordDialog: function(page_id, callback, mode, locale) {
            var cbid;
            if (typeof(callback) === "function") {
                cbid = private.create_next_guid();
                callbacks[cbid] = callback;
            }
            var args = { page_id: page_id, cbid: cbid, mode: mode, locale: locale };
            var res = private.call_sync("openPasswordDialog", args);
            if ("error" in res) {
                private.do_callback(cbid, res);
                return null;
            }
            return cbid; // useless so far.
        },

        closePasswordDialog: function() {
            return private.call_sync("closePasswordDialog");
        },

        /**
         * Open Share Menu<br>
         * Make a system notification which is equivalent to the Share Button pressed event. (VSH2.50 r77413)<br>
         * ({@link https://bugzilla.rd.scei.sony.co.jp/orbis/bugzilla/show_bug.cgi?id=79625 bug 79625})
         * @memberof sce
         */
        openShareMenu: function() {
            var an = { name: "openShareMenu", data: { session_id: private.session_id }};
            public.appNotifyToSystem(an);
        },

        bgft: {
            registerDownloadTask: function(callback, args) {
                return private.call_async("bgft.registerDownloadTask", args, callback);
            }
        },

        /**
         * Register a download task.
         * @function regsiterDownloadTask
         * @memberof sce
         * @param {function(sce.AsyncErrorResult)} callback - Callback function.
         * @param {sce.DownLoadTask} args - Grief report details.
         * @return {String} Callback ID
         */
        /**
         * @typedef {Object} DownLoadTask
         * @memberof sce
         * @property {Number} entitlement_type - Entitlement Type (5:Unified Entitlement).
         * @property {String} id - Entitlement ID.
         * @property {String} [content_url] - Content URL.
         * @property {String} content_name - Content Name.
         * @property {String} icon_path - Icon URL.
         * @property {String} playgo_scenario_id - PlayGo Scenario ID.
         * @property {Number} option -
         *     0x00 : default downloading(all data are copied before installing) <br>
         *     0x04 : download with PlayGo(only download initial payload before installing) <br>
         *     0x10 : remote download from Chihiro <br>
         *     0x80 : pre-order content (If pre-order content, remote download (0x10) also should be set) <br>
         * @property {Sring} type - Package Type.
         * @property {Sring} package_sub_type - Package Sub Type.
         * @property {Number} pkage_size - Package File Size in byte. (VSH2.5)
         *
         * @example {
         *    entitlement_type: 5,
         *    id: "UP4432-CUSA00224_00-WARTHUNDER000000",
         *    content_url: "http://gs2.ww.prod.dl.playstation.net/gs2/appkgo/prod/CUSA00224_00/4/f_a4e57e76e626925313d116b4aec4ceba04fb593de7b48dda6d95e19421d73c96/f/UP4432-CUSA00224_00-WARTHUNDER000000.json",
         *    content_name: "War Thunder",
         *    icon_path: "https://image.api.np.km.playstation.net/images/?format=png&image=http%3A%2F%2Fgs2-sec.ww.prod.dl.playstation.net%2Fgs2-sec%2Fappkgo%2Fprod%2FCUSA00224_00%2F4%2Fi_e20b84261991b5a15679897e9a730431e53be13773e25f308a48623db0a36763%2Fi%2Ficon0.png&sign=fc6030413a06368760859e8c89b37a645cda374f",
         *    playgo_scenario_id: "0",
         *    option: 4,
         *    type: "PS4GD"
         *}
         */
        registerDownloadTask: function(callback, args) {
            return private.call_async("registerDownloadTask", args, callback);
        },

        resumeDownloadTask: function(content_id, callback) {
            return private.call_async("resumeDownloadTask", { id: content_id }, callback);
        },

        getDrmContentData: function() {
            var args;
            var callback;
            if (arguments.length === 4) {
                args = {page_id: arguments[0], id: arguments[1], name: arguments[2]};
                callback = arguments[3];
            }
            else {
                args = {id: arguments[0], name: arguments[1]};
                callback = arguments[2];
            }
            return private.call_async("getDrmContentData", args, callback);
        },

        /**
         * Get DRM content status.
         * @function getDrmContentStatus
         * @memberof sce
         * @param {sce.GetDrmContentStatusCallback} callback - Callback function.
         * @param {sce.GetDrmContentStatusArgs} args - Grief report details.
         * @param {String} [page_id] - Page ID. The foreground user is referred if not specified.
         */
        /**
         * @typedef {Object} GetDrmContentStatusArgs
         * @memberof sce
         * @property {String} id - Entitlement ID or title ID
         */
        /**
         * @callback GetDrmContentStatusCallback
         * @memberof sce
         * @param {sce.GetDrmContentStatusResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetDrmContentStatusResult
         * @memberof sce
         * @property {sce.DrmContentStatus} data
         * @property {String} cbid - Callback ID
         */
        /**
         * @typedef {Object} DrmContentStatus
         * @memberof sce
         * @property {String} status -
         * <table border="1">
         * <tr><th>Content Status</th>  <th>Description</th></tr>
         * <tr><td>"none"               </td><td>The content is not installed nor downloaded</td></tr>
         * <tr><td>"downloading"        </td><td>Download is inprogress</td></tr>
         * <tr><td>"paused"             </td><td>Downloading is paused</td></tr>
         * <tr><td>"installing"         </td><td>Install is inprogress</td></tr>
         * <tr><td>"installed"          </td><td>The content has been installed and is not running</td></tr>
         * <tr><td>"running"            </td><td>The installed content is running</td></tr>
         * <tr><td>"error"              </td><td>An error happend during download or install</td></tr>
         * </table>
         * @property {String} content_id - Content ID (Usually equal to the Entitlement ID)
         * @property {String} category -
         * <table border="1">
         * <tr><th>Content Category    </th></tr>
         * <tr><td>"game_app"          </td></tr>
         * <tr><td>"nongame_mini_app"  </td></tr>
         * <tr><td>"nongame_big_app"   </td></tr>
         * <tr><td>"system_mini_app"   </td></tr>
         * <tr><td>"system_big_app"    </td></tr>
         * <tr><td>"shell_app"         </td></tr>
         * <tr><td>"disc_player"       </td></tr>
         * <tr><td>"video_service_app" </td></tr>
         * <tr><td>"ps_cloud_beta_app" </td></tr>
         * <tr><td>"additional_content"</td></tr>
         * <tr><td>"ps_cloud_ps3_app"  </td></tr>
         * <tr><td>"ps2_emu"           </td></tr>
         * <tr><td>"unknown(...)"      </td></tr>
         * </table>
         * @property {String} [ext_type] -
         * <table border="1">
         * <tr><th>Ext Type     </th></tr>
         * <tr><td>"normal"     </td></tr>
         * <tr><td>"pre-order"  </td></tr>
         * <tr><td>"push"       </td></tr>
         * <tr><td>"share-play" </td></tr>
         * <tr><td>"unknown"    </td></tr>
         * </table>
         * @property {Number} percent - Download progress in percent (0 to 100)
         * @property {Number} remain_time - Estimation of remain time to complete download in secondes.
         * @property {String} location - Location of the content ("bd", "hdd", "hdd_no_pkg", "unknown")
         * @property {Boolean} parental_lock - true if the conten is parental-locked.
         * @property {Boolean} entielement_status - true if the user is granted to launch the executable content or use the additional content.
         * @property {String} [playable_date] - Playable date in ISO 8601 format string (e.g. "2024-01-23T01:00:00Z").
         * @property {Number} [num_captured_photos] - Number of captured photos for the content
         * @property {Number} [num_captured_videos] - Number of captured vidos for the content
         *
         * @example {
         *    status: "downloading",
         *    content_id: "UP0082-CUSA00288_00-SIMPLESHOOTINGAM",
         *    category: "game_app",
         *    ext_type: "normal",
         *    percent: 26,
         *    remain_time: 33,
         *    location: "hdd",
         *    parental_lock: false,
         *    entitlement_status: "enable",
         *    num_captured_photos: 0,
         *    num_captured_videos": 0
         * }
         *
         * @example {
         *    status: "installed",
         *    content_id: "UP9000-EXDG10055_00-POPN0NOTPLAYABLE",
         *    category: "game_app",
         *    ext_type: "pre-order",
         *    percent: 100,
         *    remain_time: 0,
         *    location: "hdd",
         *    parental_lock: false,
         *    entitlement_status: "enable",
         *    playable_date: "2024-01-23T01:00:00Z",
         *    num_captured_photos: 0,
         *    num_captured_videos: 0
         * }
         *
         * @example {
         *    status: "installed",
         *    content_id: "IV0003-SWQA13299_00-AC00000000000004",
         *    category: "additional_content",
         *    percent: 100,
         *    remain_time: 0,
         *    location: "hdd",
         *    parental_lock: false,
         *    entitlement_status: "disable"
         * }
         */
        getDrmContentStatus: function(callback, args, page_id) {
            if (page_id) {
                args.page_id = page_id;
            }
            return private.call_async("getDrmContentStatus", args, callback);
        },

        /**
         * Get Free Space
         * @function getFreeSpace
         * @memberof sce
         * @param {sce.GetFreeSpaceCallback} callback - Callback function.
         * @return {String} Callback ID
         */
        /**
         * @callback GetFreeSpaceCallback
         * @memberof sce
         * @param {sce.GetFreeSpaceResult|sce.AsyncErrorResult} res
         */
        /**
         * @typedef {Object} GetFreeSpaceResult
         * @memberof sce
         * @property {sce.GetFreeSpaceResultData} data
         * @property {String} cbid - Callback ID
         *
         * @example {data: {available_size: 1293942784}, cbid:"1415347785193_14"}
         */
        /**
         * @typedef {Object} GetFreeSpaceResultData
         * @memberof sce
         * @property {Number} available_size - Size of available free space in byte
         * @property {String} cbid - Callback ID
         */
        getFreeSpace: function(callback) {
            var args;
            return private.call_async("getFreeSpace", args, callback);
        },

        getGlsServiceAttributesValue : function(args, callback) {
            return private.call_async("getGlsServiceAttributesValue", args, callback);
        },

        mc : {
            registerUpdateListener: function(scheme, objname, callback) {
                if (typeof(callback) === "function") {
                    if (mc_callbacks[scheme] === undefined) {
                        mc_callbacks[scheme] = {};
                    }
                    mc_callbacks[scheme][objname] = callback;
                }
            },

            trigger: function(event_name, attributes) {
                var args = {event_name: event_name, attributes: attributes};
                return private.call_sync("mc.trigger", args);
            }
        },

        /**
         * Play Sound Effect.
         * @function playSe
         * @memberof sce
         * @param {String} sound_id - Sound ID. <br>
         * (e.g. "se_system_boot_up", "se_system_resume", "se_system_standby", "se_std_cursor1", "se_std_enter1", "se_std_cancel1",
         * "se_std_option1", "se_std_cursor2", "se_std_enter2", "se_std_cancel2", "se_std_ng_disabled", "se_log_login", "se_log_login2",
         * "se_log_logout", "se_log_cursor", "se_fnc_cursor_in", "se_fnc_cursor", "se_fnc_enter", "se_cz_show", "se_cz_cursor_in1",
         * "se_cz_cursor_in2", "se_cz_cursor", "se_cz_enter1", "se_cz_enter2", "se_live_cursor_in", "se_live_cursor", "se_live_item_enter1",
         * "se_live_item_enter2", "se_live_item_update", "se_live_gallery_swap", "se_tv_cursor", "se_tv_item_enter1", "se_tv_item_enter2",
         * "se_fap_cursor", "se_fap_cursor_parent", "se_fap_cursor_child", "se_fap_cursor_enter", "se_osk_key_press", "se_osk_tb_caret_move",
         * "se_osk_cursor_move", "se_osk_backspace", "se_osk_ime_enter", "se_osk_ime_cancel", "se_osk_enter_close", "se_osk_cancel_close",
         * "se_osk_tb_error", "se_dlg_yes", "se_dlg_no", "se_dlg_ok", "se_dlg_cancel", "se_dlg_show_positive", "se_dlg_show_negative",
         * "se_msg_notification", "se_msg_system_msg", "se_msg_trophy", "se_msg_party_enter", "se_msg_party_quit", "se_msg_ng_psbutton",
         * "se_boot_game_boot", "se_boot_game_quit", "se_boot_miniapp_boot", "se_boot_miniapp_quit", "se_boot_swap_apps", "se_boot_swap_game",
         * "se_impose_open", "se_ss_captured", "se_psvr_mw_begin", "se_psvr_mw_end", "se_psvr_command", "se_face_detected")
         * @return {String} Callback ID
         */
        playSe : function(sound_id) {
            return private.call_async("playSe", {sound_id: sound_id});
        },

        /**
         * Post a grief report.
         * @function postGriefReport
         * @memberof sce
         * @param {sce.GriefReport} args - Grief report details.
         * @return {String} Callback ID
         */
        /**
         * @typedef {Object} GriefReport
         * @memberof sce
         * @property {String} online_id - On-line ID.
         * @property {String} story_id - Story ID.
         * @property {String} [comment_id] - Comment ID. (VSH2.50)
         * @property {String} body - JSON string of story to be reported.
         * @property {function(sce.AsyncErrorResult)} callback - Callback function
         * @example {
         *  online_id : "jmwtpgj1",
         *  story_id : "550e8400-e29b-41d4-a716-446655440000",
         *  body : '{ "foo": "foo", "bar": 1}',
         *  callback :  function(a) { console.log(JSON.stringify(a)); }
         *}
         */
        postGriefReport: function (args) {
            return private.call_async("postGriefReport", args, args.callback);
        },

        /**
         * Read a registry.<br>
         * <table border="1">
         *   <caption>Supported registries</caption>
         *   <tr><th>Registry Name</th>                     <th>Type</th>                <th>Comment</th></tr>
         *   <tr><td>"accessibility_bold_text"</td>         <td>Boolean</td>             <td>(VSH3.0)</td></tr>
         *   <tr><td>"accessibility_high_contrast"</td>     <td>Boolean</td>             <td>(VSH3.0)</td></tr>
         *   <tr><td>"accessibility_large_text"</td>        <td>Boolean</td>             <td>(VSH3.0)</td></tr>
         *   <tr><td>"accessibility_marquee_speed"</td>     <td>Number</td>              <td>-2, -1, 0, 1 (VSH3.0)</td></tr>
         *   <tr><td>"accessibility_tts_enable"</td>        <td>Boolean</td>             <td>(VSH3.0)</td></tr>
         *   <tr><td>"age_verified"</td>                    <td>Number</td></tr>
         *   <tr><td><strike>"auto_download"</strike></td>  <td>Bool</td>                <td>Obsolete (VSH2.5)</td></tr>
         *   <tr><td>"date_format"</td>                     <td>String</td>              <td>"YYY/MM/DD", "DD/MM/YYYY", "MM/DD/YYYY"</td></tr>
         *   <tr><td>"geo_filtering"</td>                   <td>String</td>              <td>"normal", "always_scceeded", "always_fail"</td></tr>
         *   <tr><td>"gf_version"</td>                      <td>String</td></tr>
         *   <tr><td>"grc"</td>                             <td>String</td></tr>
         *   <tr><td>"grc_dev"</td>                         <td>String</td></tr>
         *   <tr><td>"hdcp_on"</td>                         <td>Boolean</td></tr>
         *   <tr><td>"kamaji"</td>                          <td>String</td></tr>
         *   <tr><td>"net_common_device"</td>               <td>String</td>              <td>"cable", "wifi", "unknown"</td></tr>
         *   <tr><td>"net_app_http_proxy_enable"</td>       <td>Boolean</td></tr>
         *   <tr><td>"net_wifi_app_http_proxy_enable"</td>  <td>Boolean</td></tr>
         *   <tr><td>"np_debug"</td>                        <td>Boolean</td></tr>
         *   <tr><td>"np_env"</td>                          <td>String</td></tr>
         *   <tr><td>"sf_debug"</td>                        <td>Boolean</td></tr>
         *   <tr><td>"signin_on_standby"</td>               <td>Boolean</td></tr>
         *   <tr><td>"summer_time"</td>                     <td>Boolean</td></tr>
         *   <tr><td>"system_version"</td>                  <td>String</td></tr>
         *   <tr><td>"time_format"</td>                     <td>Number</td>              <td>12, 24</td></tr>
         * </table>
         * @function readRegistry
         * @memberof sce
         * @param {String} reg_name - Registry name.
         * @param {String} [page_id] - Page ID. The foreground user's registry is referred if not specified.
         * @return {String|Number|Boolean|sce.SyncErrorResult} Value.
         */
        readRegistry : function(reg_name, page_id) {
            if (reg_name === "system_version" && system_version.length === 3) {
                return system_version.join('.');
            }
            if (navigator.sce && navigator.sce.native && typeof(navigator.sce.native.readRegistries) === "function") {
                var val = navigator.sce.native.readRegistries([reg_name])[reg_name];
                if (val !== undefined) {
                    return val;
                }
            }
            var args = {name: reg_name};
            if (page_id) {
                args["page_id"] = page_id;
            }
            return private.call_sync("readRegistry", args);
        },

        /**
         * Write a registry.<br>
         * <table border="1">
         *   <caption>Supported registries</caption>
         *   <tr><th>Registry Name</th><th>Type</th></tr>
         *   <tr><td>"age_verified"</td>                    <td>Number</td></tr>
         *   <tr><td>"signin_on_standby"</td>               <td>Boolean</td></tr>
         * </table>
         * @function writeRegistry
         * @memberof sce
         * @param {String} reg_name - Registry name.
         * @param {String} [page_id] - Page ID. The foreground user's registry is referred if not specified.
         * @return {{}|sce.SyncErrorResult} Value.
         */
        writeRegistry: function(reg_name, value, page_id) {
            var args = {name: reg_name, value: value};
            if (page_id) {
                args["page_id"] = page_id;
            }
            return private.call_sync("writeRegistry", args);
        },

        /**
         * Send a request to show the System Notification. The max number of lines is 6. Ellipsis is shown at the end of the 6th line if exceeded.
         * <p><a href="images/Notification.png"><img src="images/Notification.png" width="50%"></a></p>
         * @function sendNotificationRequest
         * @memberof sce
         * @param {String} message - a message string to be shown.
         * @return {String} Callback ID
         */
        sendNotificationRequest: function(message) {
            var args = { message: message };
            return private.call_async("sendNotificationRequest", args);
        },

        /**
         * Send a request to show the System Notification for TRC check.
         * The system accepts and shows the message only when the "TRC Check Notification" setting is enable.
         * The number of lines is not limited. However the bottom of 27th line is out of screen.
         * <p><a href="images/TrcCheckNotification.png"><img src="images/TrcCheckNotification.png" width="50%"></a></p>
         * @function sendTrcCheckNotificationRequest
         * @memberof sce
         * @param {String} message - a message string to be shown.
         * @return {String} Callback ID
         */
        sendTrcCheckNotificationRequest: function(message) {
            var args = { message: message };
            return private.call_async("sendTrcCheckNotificationRequest", args);
        },

        /**
         * Send a request to show the System Notification for NP Debug.
         * The system accepts and shows the message only when the "NP Debug" setting is enable.
         * The number of lines is not limited. However the bottom of 27th line is out of screen.
         * <p><a href="images/NpDebugNotification.png"><img src="images/NpDebugNotification.png" width="50%"></a></p>
         * @function sendNpDebugNotificationRequest
         * @memberof sce
         * @param {String} message - a message string to be shown.
         * @return {String} Callback ID
         */
        sendNpDebugNotificationRequest: function(message) {
            var args = { message: message };
            return private.call_async("sendNpDebugNotificationRequest", args);
        },

        /**
         * Speech Synthesis APIs name space (VSH3.00)
         * @class
         * @memberof sce
         */
        ss: {
            /**
             * Cancel all utterances from queue. If an utterance is being spoken, speaking ceases immediately. (VSH3.00)
             * @function cancel
             * @memberof sce.ss
             * @param {Function} [callback] - callback function to be called after the cancellation completes.
             * @return {String} Callback ID
             */
            cancel: function(callback) {
                return private.call_async("ss.cancel", null, callback);
            },

            /**
             * @function getState
             * @memberof sce.ss
             * @param {sce.ss.SsGetStatusCallback} callback - callback function to get the state.
             * @return {String} Callback ID
             */
            /**
             * @callback SsGetStatusCallback
             * @memberof sce.ss
             * @param {sce.ss.SsGetStatusResult} res
             */
            /**
             * @typedef {Object} SsGetStatusResult
             * @memberof sce.ss
             * @property {Booelan} speaking - true if an utterance is being spoken.
             * @property {String} cbid - Callback ID
             * @example { speaking: true, cbid: "1432106512575_15"}
             */
            getState: function(callback) {
                return private.call_async("ss.getState", null, callback);
            },

            /**
             * @function speak
             * @memberof sce.ss
             * @param {Function} [callback] - callback function to be called after the appending completes.
             * @return {String} Callback ID
             */
            speak: function(text, callback) {
                var args = { text: text };
                return private.call_async("ss.speak", args, callback);
            },
        },

        updatePreOrderPlayableDate: function(entitlement_id, playable_date, callback) {
            var args = { id: entitlement_id, date: playable_date };
            return private.call_async("updatePreOrderPlayableDate", args, callback);
        },

        updateUnifiedEntitlementRif: function(page_id, entitlement_id, callback) {
            var args = { entitlement_id: entitlement_id };
            if (page_id) {
                args["page_id"] = page_id;
            }
            return private.call_async("updateUnifiedEntitlementRifs", args, callback);
        },

        updateUnifiedEntitlementRifs: function(page_id, callback) {
            var args;
            if (page_id) {
                args = {page_id: page_id};
            }
            return private.call_async("updateUnifiedEntitlementRifs", args, callback);
        },

        /**
         * @class
         * @memberof sce
         */
        vc : {
            /**
             * Create Streadm UID (async version VSH2.50)
             * @memberof sce.vc
             * @function createStreamUid
             * @param {sce.vc.CreateStreamUidCallback} callback - Callback function
             * @return {String} Callback ID
             */
            /**
             * @callback CreateStreamUidCallback
             * @memberof sce.vc
             * @param {sce.vc.CreateStreamUidResult|sce.AsyncErrorResult} res
             */
            /**
             * @typedef {Object} CreateStreamUidResult
             * @memberof sce.vc
             * @property {Number} stream_uid - Stream UID.
             * @example  { stream_uid: 1, cbid: "1417595579338_24" }
             */
            /**
             * Create Streadm UID (sync version)
             * @memberof sce.vc
             * @function createStreamUid
             * @return {Number} Stream UID
             */
            createStreamUid : function(callback) {
                if (typeof(callback) === "function") {
                    return private.call_async("vc.createStreamUid", null, callback);
                }
                else {
                    return private.call_sync("vc.createStreamUid");
                }
            },

            decript : function(data, callback) {
                args = {data: data};
                return private.call_async("vc.decript", args, callback);
            },

            decrypt : function(data, callback) {
                args = {data: data};
                return private.call_async("vc.decrypt", args, callback);
            },

            sendSyncRequest : function(vc, stream_uid, request) {
                var args = { vc: vc, stream_uid: stream_uid, request: request};
                return private.call_sync("vc.sendSyncRequest", args)
            },

            sendAsyncRequest : function(vc, stream_uid, request, callback) {
                var args = { vc: vc, stream_uid: stream_uid, request: request};
                return private.call_async("vc.sendAsyncRequest", args, callback);
            },

            updateLicense: function(access_token, action_token, file_id, callback) {
                var args = {access_token: access_token, action_token: action_token, file_id: file_id};
                return private.call_async("vc.updateLicense", args, callback);
            },
        },

        cloudClient : {
            callAsyncApi: function(api_name, args, callback) {
                return private.call_async(api_name, args, callback);
            },
        },

    };

    function getQueriesFromUrl() {
        var query = location.search.substr(1);
        var result = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    // Extesions by Injected Bundle
    if (navigator.sce && navigator.sce.native) {
        if (typeof(navigator.sce.native.getNetworkTime) === "function") {
            public.getNetworkTime = navigator.sce.native.getNetworkTime;
        }
    }

    // setup event listener for Music Core
    public.addSystemEventListener("music_event",
        function(system_event) {
            var scheme = system_event.scheme;
            var objname = system_event.objname;
            var res = system_event.res;
            var f = mc_callbacks[scheme][objname];
            if (f) {
                f(res);
            }
        });

    // read system version.
    var ver;
    var queries = getQueriesFromUrl();
    if ("sys_ver" in queries) {
        ver = queries.sys_ver;
    }
    else {
        ver = public.readRegistry("system_version");
    }
    if (typeof(ver) === "string") {
        system_version = ver.split('.');
    }

    device_id = queries.DeviceId;

    //public.readAllRegistries();
    window.sce = public;
    //window.sce.private = private;

})();

var performance = window.performance || {};
performance.now = (function() {
    return performance.now || performance.webkitNow;
})();