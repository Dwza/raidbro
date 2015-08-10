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
      guild: this.props.guild,
      realm: this.props.realm,
      region: this.props.region
    }

    let i = 0;
    for (let region in REGIONS) {
      let regionName = REGIONS[region];
      state.regions.push({
        id: i,
        region: region,
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
      region: this.state.region
    });

    return (
      <div>
        <TextField
          defaultValue={this.state.guild}
          hintText="example: Nightfall"
          floatingLabelText="Guild"
          onChange={this._handleGuildChange} />

        <br />

        <TextField
          defaultValue={this.state.realm}
          hintText="example: Emerald Dream"
          floatingLabelText="Realm"
          onChange={this._handleRealmChange} />

        <br />

        <SelectField
          onChange={this._handleRegionChange}
          floatingLabelText="Region"
          valueMember="region"
          value={this.state.region}
          displayMember="name"
          menuItems={this.state.regions} />

        <br />

        <RaisedButton label="Find my guild" primary={true} onTouchTap={onSearch} />

      </div>
    );
  },

  _handleGuildChange: function (event) {
    let newGuild = event.target.value;
    this.setState({guild: newGuild});
  },

  _handleRealmChange: function (event) {
    let newRealm = event.target.value;
    this.setState({realm: newRealm});
  },

  _handleRegionChange: function (event) {
    let newRegion = event.target.value;
    this.setState({region: newRegion});
  }

});

module.exports = GuildSearch;
