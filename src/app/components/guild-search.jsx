/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let RaisedButton = mui.RaisedButton;
let SelectField = mui.SelectField;
let TextField = mui.TextField;


let REGIONS = require('../wow-util').REGIONS;


let GuildSearch = React.createClass({

  getInitialState: function() {

    // Defaults
    let state = {
      regions: [],
      guild: 'nightfall',
      realm: 'emerald-dream',
      origin: 'us'
    }

    let i = 0;
    for (let origin in REGIONS) {
      let regionName = REGIONS[origin];
      state.regions.push({
        id: i,
        origin: origin,
        name: regionName
      });
      i++;
    }

    return state;
  },

  render: function() {


    let onSearch = this.props.onSearch.bind(null, {
      guild: this.state.guild,
      realm: this.state.realm,
      region: this.state.origin
    });

    return (
      <div>
        <h1>Search for your guild</h1>

        <TextField
          defaultValue="Nightfall"
          hintText="example: Nightfall"
          floatingLabelText="Guild"
          onChange={this._handleGuildChange} />

        <br />

        <TextField
          defaultValue="Emerald Dream"
          hintText="example: Emerald Dream"
          floatingLabelText="Realm"
          onChange={this._handleRealmChange} />

        <br />

        <SelectField
          onChange={this._handleRegionChange}
          floatingLabelText="Region"
          valueMember="id"
          displayMember="name"
          menuItems={this.state.regions} />

        <br />

        <RaisedButton label="Find my guild" primary={true} onTouchTap={onSearch} />

      </div>
    );
  },

  _handleGuildChange: function (event) {
    this.state.guild = event.target.value;
    console.log('guild name changed: ' + this.state.guild);
  },

  _handleRealmChange: function (event) {
    this.state.realm = event.target.value;
    console.log('realm changed: ' + this.state.realm);
  },

  _handleRegionChange: function (event) {
    this.state.origin = event.target.value.origin;
    console.log("region changed:" + this.state.origin);
  }

});

module.exports = GuildSearch;
