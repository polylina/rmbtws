"use strict";

/**
 * Handles the communication with the ControlServer
 * @param rmbtTestConfig RMBT Test Configuratio
 * @param headers HTTP headers to send in the requests
 * @param testServerConfig Measurement server info
 * @returns Object
 */
export const RMBTControlServerCommunication = (rmbtTestConfig, headers, testServerConfig) => {
    const _rmbtTestConfig = rmbtTestConfig;
    const  _logger = log && log.getLogger ? log.getLogger("rmbtws") : new MockLogger();

    return {
        /**
         *
         * @param {RMBTControlServerRegistrationResponseCallback} onsuccess called on completion
         */
        obtainControlServerRegistration: (onsuccess, onerror) => {
            let json_data = {
                version: _rmbtTestConfig.version,
                language: _rmbtTestConfig.language,
                uuid: _rmbtTestConfig.uuid,
                type: _rmbtTestConfig.type,
                version_code: _rmbtTestConfig.version_code,
                client: _rmbtTestConfig.client,
                timezone: _rmbtTestConfig.timezone,
                time: new Date().getTime(),
                measurement_server_id: testServerConfig ? testServerConfig.id : undefined
            };

            //add additional parameters from the configuration, if any
            Object.assign(json_data, _rmbtTestConfig.additionalRegistrationParameters);

            if (typeof userServerSelection !== "undefined" && userServerSelection > 0 && typeof UserConf !== "undefined" && UserConf.preferredServer !== undefined && UserConf.preferredServer !== "default") {
                json_data['prefer_server'] = UserConf.preferredServer;
                json_data['user_server_selection'] = userServerSelection;
            }
            $.ajax({
                headers,
                url: _rmbtTestConfig.controlServerURL + _rmbtTestConfig.controlServerRegistrationResource,
                type: "post",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(json_data),
                success: (data) => {
                    let config = new RMBTControlServerRegistrationResponse(data);
                    onsuccess(config);
                },
                error: () => {
                    _logger.error("error getting testID");
                    onerror();
                }
            });
        },

        /**
         * get "data collector" metadata (like browser family) and update config
         *
         */
        getDataCollectorInfo: () => {
            $.ajax({
                headers,
                url: _rmbtTestConfig.controlServerURL + _rmbtTestConfig.controlServerDataCollectorResource,
                type: "get",
                dataType: "json",
                contentType: "application/json",
                success: (data) => {
                    _rmbtTestConfig.product = data.agent.substring(0, Math.min(150, data.agent.length));
                    _rmbtTestConfig.model = data.product;
                    //_rmbtTestConfig.platform = data.product;
                    _rmbtTestConfig.os_version = data.version;
                },
                error: (data) => {
                    _logger.error("error getting data collection response");
                }
            });
        },

        /**
         *  Post test result
         *
         * @param {Object}  json_data Data to be sent to server
         * @param {Function} callback
         */
        submitResults: (json_data, onsuccess, onerror) => {
            //add additional parameters from the configuration, if any
            Object.assign(json_data, _rmbtTestConfig.additionalSubmissionParameters);

            let json = JSON.stringify(json_data);
            _logger.debug("Submit size: " + json.length);
            $.ajax({
                headers,
                url: _rmbtTestConfig.controlServerURL + _rmbtTestConfig.controlServerResultResource,
                type: "post",
                dataType: "json",
                contentType: "application/json",
                data: json,
                success: (data) => {
                    _logger.debug(json_data.test_uuid);
                    onsuccess(true);
                },
                error: (data) => {
                    _logger.error("error submitting results");
                    onerror(false);
                }
            });
        }
    };
};