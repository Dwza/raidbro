/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let GuildSearch = require('./guild-search.jsx');
let GuildSummary = require('./guild-summary.jsx');

let Server = require('../server');
let WowUtil = require('../wow-util');

let Main = React.createClass({

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

    let days = localStorage.getItem('days') || 7;
    let guild = localStorage.getItem('guild') || 'limit';
    let realm = localStorage.getItem('realm') || 'illidan';
    let region = localStorage.getItem('region') || 'us';

    // Defaults
    let state = {
      roster: [],
      days: days,
      guild: guild,
      realm: realm,
      region: region
    };

    return state;
  },

  //TODO how is WoW armory able to get an item's bonusList (warforged, socket, ..) e.g. http://us.battle.net/wow/en/character/emerald-dream/Ojbect/feed

  _handleGuildSearch: function (terms) {
    // User has submitted a guild, now search for it by querying our API

    let region = terms.region;

    // inflect into a compatible string for WoW API, e.g. Lightning's Blade -> lightnings-blade
    let realmSlug = terms.realm;
    realmSlug = realmSlug.replace(/ /g, '-').replace(/'/g, '');

    //TODO allow only list of realms from us.api.battle.net/wow/realm/status
    let guildSlug = terms.guild;

    // Get guild roster
    let path = Server.buildUrl('roster', region, realmSlug, guildSlug);
    console.log('path: ' + path);

    let self = this;

    $.getJSON(path, function(data) {
      let roster = WowUtil.parseRoster(data, 4);
      self.setState({roster: roster});
    })
    .fail(function(response){
      console.log('Failed GET ' + path);
      console.log(response);
    });

    this.setState({
      realm: realmSlug,
      guild: guildSlug,
      region: region
    });
  },

  render: function() {

    let containerStyle = {
      textAlign: 'center'
    };

    return (
      <div style={containerStyle}>

        <GuildSearch
          ref="search"
          guild={this.state.guild}
          realm={this.state.realm}
          region={this.state.region}
          onSearch={this._handleGuildSearch} />

        <GuildSummary
          ref='summary'
          roster={this.state.roster}
          days={this.state.days}
          guild={this.state.guild}
          realm={this.state.realm}
          region={this.state.region} />

      </div>
    );
  }

});

module.exports = Main;
