/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');

// Material UI
let {
  AppBar,
  CircularProgress,
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
      accent1Color: Colors.indigo400
    });
  },

  getInitialState: function() {

    let days = localStorage.getItem('days') || 7;
    let guild = localStorage.getItem('guild') || 'Nightfall';
    let realm = localStorage.getItem('realm') || 'Emerald Dream';
    let region = localStorage.getItem('region') || 'us';

    // Defaults
    let state = {
      isSearching: false,
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
  /*
   * User has submitted a guild, now search for it by querying our API
   */
  _handleGuildSearch: function (terms) {
    this.setState({
      isSearching: true
    });

    let region = terms.region;
    let guild = terms.guild.capitalize();
    let realm = terms.realm.capitalize();

    // inflect into a compatible string for WoW API, e.g. Lightning's Blade -> lightnings-blade
    let realmSlug = realm.replace(/ /g, '-').replace(/'/g, '');

    //TODO allow only list of realms from us.api.battle.net/wow/realm/status
    let guildSlug = guild;

    // Get guild roster
    let path = Server.buildUrl('roster', region, realmSlug, guildSlug);
    console.log('path: ' + path);

    let self = this;

    $.getJSON(path, function(data) {
      let roster = WowUtil.parseRoster(data, 4);

      self.setState({
        isSearching: false,
        isSearchVisible: false,
        isSummaryVisible: true,
        roster: roster,
        realm: realmSlug,
        guild: guildSlug,
        region: region
      });
    })
    .fail(function(response) {
      console.log('Failed GET ' + path);
      console.log(response);
    });

    // Save last search in browser storage
    localStorage.setItem('guild', guild);
    localStorage.setItem('realm', realm);
    localStorage.setItem('region', region);
  },

  render: function() {

    let containerStyle = {
      textAlign: 'center'
    };


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

    let searchBox = null;
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

    let searchInProgress = null;
    if (this.state.isSearching && this.state.isSearchVisible) {
      searchInProgress =
        <CircularProgress
          mode="indeterminate"
          size={2} />;
    }

    return (
      <div ref="main" style={containerStyle}>

        {searchBox}

        {searchInProgress}

        {summaryBox}

        <Snackbar
          ref="searchToggle"
          message={'<' + this.state.guild + '> ' + this.state.realm}
          action="Search Again"
          onActionTouchTap={this._handleSearchAgain}/>

        <div
          ref="footer"
          style={{'paddingBottom': 100}} />
      </div>
    );
  },

  _handleSearchAgain: function () {
    this.setState({
      isSearchVisible: true
    });
  },

  componentDidUpdate: function() {
    if (this.state.isSearchVisible) {
      this.refs.searchToggle.dismiss();
    }
    else {
      this.refs.searchToggle.show();
    }
  }


});

module.exports = Main;
