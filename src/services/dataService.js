export var dataService = {
    saveName: function(name) {
        axios.post('api/names', {
            name: name
        });
    },

    getNames: function() {
        return axios.get('api/names');
    }
};
