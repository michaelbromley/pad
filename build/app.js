System.register(["services/dataService.js"], function (_export) {
    "use strict";

    var dataService, NameInput, NamesList, App;
    return {
        setters: [function (_servicesDataServiceJs) {
            dataService = _servicesDataServiceJs.dataService;
        }],
        execute: function () {

            "use strict";

            NameInput = React.createClass({
                displayName: "NameInput",

                render: function render() {
                    return React.createElement(
                        "div",
                        null,
                        React.createElement("input", { type: "text", ref: "name" }),
                        React.createElement(
                            "button",
                            { onClick: this.saveName },
                            "Save Name"
                        )
                    );
                },

                saveName: function saveName() {
                    dataService.saveName(this.refs.name.getDOMNode().value);
                }
            });
            NamesList = React.createClass({
                displayName: "NamesList",

                render: function render() {
                    var items = this.props.names ? this.props.names.map(function (name) {
                        return React.createElement(
                            "li",
                            null,
                            name
                        );
                    }) : [];

                    return React.createElement(
                        "ul",
                        null,
                        items
                    );
                }

            });
            App = React.createClass({
                displayName: "App",

                getInitialState: function getInitialState() {
                    return {
                        names: []
                    };
                },

                refreshList: function refreshList() {
                    var _this = this;

                    dataService.getNames().then(function (data) {
                        console.log(data);
                        _this.setState({
                            names: data.data
                        });
                    });
                },

                render: function render() {
                    return React.createElement(
                        "div",
                        null,
                        React.createElement(
                            "h1",
                            null,
                            "List of Names"
                        ),
                        React.createElement(NameInput, null),
                        React.createElement(
                            "button",
                            { onClick: this.refreshList },
                            "Refresh"
                        ),
                        React.createElement(NamesList, { names: this.state.names })
                    );
                }
            });

            React.render(React.createElement(App, null), document.body);
        }
    };
});