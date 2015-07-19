/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let RaisedButton = mui.RaisedButton;
let SelectField = mui.SelectField;
let TextField = mui.TextField;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let Main = React.createClass({

  REGIONS: [
    { id: 0, origin: 'us', name: 'North America' },
    { id: 1, origin: 'eu', name: 'Europe' },
    { id: 2, origin: 'cn', name: 'Asia' },
    { id: 3, origin: 'kr', name: 'Korea' },
    { id: 4, origin: 'tw', name: 'Taiwan' }
  ],

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  getInitialState: function() {

    // Defaults
    let state = {
      guild: 'nightfall',
      realm: 'emerald-dream',
      origin: 'us'
    }

    return state;
  },

  render: function() {

    let containerStyle = {
      textAlign: 'center',
      paddingTop: '200px'
    };

    return (
      <div style={containerStyle}>

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
          menuItems={this.REGIONS} />

        <br />

        <RaisedButton label="Super Secret Password" primary={true} onTouchTap={this._handleSearchGuild} />

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
  },

  _handleSearchGuild: function () {
    // User has submitted a guild, now search for it by querying our API

    // inflect realm into the WoW API compatible string, e.g. kel'thuzad -> kelthuzad
    let realmSlug = this.state.realm;
    realmSlug = realmSlug.replace(' ', '-').replace("'", '');

    let guildSlug = this.state.guild;
    guildSlug = guildSlug.replace(' ', '_');

    //TODO allow only list of realms from us.api.battle.net/wow/realm/status

    let path = 'http://localhost:9000/' + realmSlug + '/' + guildSlug;

    $.getJSON(path, function( data ) {
      console.log(data);
    });

  }

});

module.exports = Main;
