/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');

// Material UI
let {
  AppBar,
  FlatButton,
  IconButton,
  Snackbar,
  Styles
} = require('material-ui');
let Colors = Styles.Colors;
let ThemeManager = new Styles.ThemeManager();
let CloseIcon = require('material-ui/lib/svg-icons/navigation/close');
let SearchIcon = require('material-ui/lib/svg-icons/action/search');

// Project specific
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
      isSearchVisible: true,
      isSummaryVisible: false,
      roster: [],
      days: days,
      guild: guild,
      realm: realm,
      region: region
    };

    return state;
  },

  //TODO race condition when Search is clicked 2nd time while 1st guild is being displayed.
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

      self.setState({
        isSearchVisible: false,
        isSummaryVisible: true,
        roster: roster,
        realm: realmSlug,
        guild: guildSlug,
        region: region
      });
    })
    .fail(function(response){
      console.log('Failed GET ' + path);
      console.log(response);
    });
  },


  _onLeftIconButtonTouchTap: function (event) {
    console.log('aihewot' + event);

  },

  _onRightIconButtonTouchTap: function(event) {
    let bool = this.state.isSearchVisible;
    console.log('touched ' + bool);
    this.setState({
      isSearchVisible: !bool
    });
  },

  render: function() {

    let containerStyle = {
      textAlign: 'center'
    };

    let searchBox = null;
    let summaryBox = null;
    if (this.state.isSummaryVisible) {
      summaryBox =
        <GuildSummary
          ref='summary'
          roster={this.state.roster}
          days={this.state.days}
          guild={this.state.guild}
          realm={this.state.realm}
          region={this.state.region} />;
    }
    if (this.state.isSearchVisible) {
      searchBox =
        <GuildSearch
            ref="search"
            guild={this.state.guild}
            realm={this.state.realm}
            region={this.state.region}
            onSearch={this._handleGuildSearch} />;
    }

    // TODO wait for React 1.0.0 because there is a bug with onTouchTap events
    // when using React 0.13 and touch plugin 1.7
    // let bar = React.createElement(AppBar, {
    //     zDepth: 3,
    //     title: 'RaidBro',
    //     onLeftIconButtonTouchTap: this._onLeftIc333onButtonTouchTap,
    //     onRightIconButtonTouchTap: this._onRightIconButtonTouchTap,
    //     iconElementLeft: <IconButton><CloseIcon /></IconButton>,
    //     iconElementRight: <IconButton><SearchIcon /></IconButton>
    // });

    return (
      <div ref="main" style={containerStyle}>

        {searchBox}

        {summaryBox}

        <Snackbar
          ref="searchToggle"
          message={'<' + this.state.guild + '> ' + this.state.realm}
          action="Search Again"
          onActionTouchTap={this._handleSearchAgain}/>

      </div>
    );
  },

  _handleSearchAgain: function () {
    console.log("Closing snackbar, showing search. ");
    this.setState({
      isSearchVisible: true
    });
  },

  componentDidUpdate: function() {
    if (this.state.isSearchVisible) {
      console.log("Hiding snackbar");
      this.refs.searchToggle.dismiss();
    }
    else {
      console.log("Showing snackbar");
      this.refs.searchToggle.show();
    }
  }


});

module.exports = Main;
