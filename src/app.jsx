import { dataService } from 'services/dataService.js';
"use strict";

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;

var NameInput = React.createClass({

    render: function() {
        return (
            <div>
                <input type="text" ref="name" />
                <button onClick={this.saveName}>Save Name</button>
            </div>
        );
    },

    saveName: function() {
        dataService.saveName(this.refs.name.getDOMNode().value);
    }
});

var NamesList = React.createClass({

    render: function() {
        var items = this.props.names ? this.props.names.map(name => <li>{name}</li>) : [];

        return (
            <ul>
            {items}
            </ul>
        );
    }

});

var App = React.createClass({

    getInitialState: function() {
        return {
            names: []
        };
    },

    refreshList: function() {
        dataService.getNames()
            .then(data => {
                console.log(data);
                this.setState({
                    names: data.data
                });
            });
    },

    render: function() {
        return (
            <div>
                <h1>List of Names</h1>
                <NameInput />
                <button onClick={this.refreshList}>Refresh</button>
                <NamesList names={this.state.names} />
            </div>
        );
    }
});

React.render(<App />, document.body);