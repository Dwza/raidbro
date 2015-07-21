/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;

let GuildSearch = require('./guild-search.jsx');


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

    // Defaults
    let state = {
      guild: 'nightfall',
      realm: 'emerald-dream',
      origin: 'us'
    };

    return state;
  },

  _handleGuildSearch: function (terms) {
    // User has submitted a guild, now search for it by querying our API

    // inflect into a compatible string for WoW API, e.g. kel'thuzad -> kelthuzad, Emerald Dream -> emerald-dream
    let realmSlug = terms.realm;
    realmSlug = realmSlug.replace(' ', '-').replace("'", '');

    let guildSlug = terms.guild;
    guildSlug = guildSlug.replace(' ', '_');

    //TODO allow only list of realms from us.api.battle.net/wow/realm/status

    let path = 'http://localhost:9000/' + realmSlug + '/' + guildSlug;

    $.getJSON(path, function( data ) {
      console.log(data);
    });
  },

  render: function() {

    let containerStyle = {
      textAlign: 'center'
    };

    return (
      <div style={containerStyle}>
        <GuildSearch onSearch={this._handleGuildSearch} />
      </div>
    );
  }

});

module.exports = Main;
