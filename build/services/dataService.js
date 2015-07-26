System.register([], function (_export) {
    'use strict';

    var dataService;
    return {
        setters: [],
        execute: function () {
            dataService = {
                saveName: function saveName(name) {
                    axios.post('api/names', {
                        name: name
                    });
                },

                getNames: function getNames() {
                    return axios.get('api/names');
                }
            };

            _export('dataService', dataService);
        }
    };
});