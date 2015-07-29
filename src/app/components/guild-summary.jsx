let React = require('react');
let mui = require('material-ui');

//TODO use a custom table so we can render rows and cells separately.
let Table = mui.Table;

let Server = require('../server');
let WowUtil = require('../wow-util');


let GuildSummary = React.createClass({

  // Process data into a Table-friendly format
  makeRows: function (data) {

    let rowData = [];

    for (let name in data) {
      let info = data[name];

      let nameLink = <a href={'http://us.battle.net/wow/en/character/' + this.props.realm + '/' + name + '/advanced'} target="_blank">{name}</a>;

      let ilvl = info.averageItemLevel + '/' + info.averageItemLevelEquipped;

      let attendance = info.attendance + '%';

      let loot = info.items.map(function (i) {
        let href = "http://www.wowhead.com/item=" + i.itemId;
        return (
          <div>
            <a target="_blank" href={href} class="q4">{i.timestamp}</a>
            <br/>
          </div>
        );
      });

      rowData.push({
        name: {content: nameLink},
        ilvl: {content: ilvl},
        attendance: {content: attendance},
        loot: {content: loot}
      })
    }

    return rowData;
  },

  getInitialState: function() {
    return {
      fixedHeader: true,
      fixedFooter: false,
      stripedRows: true,
      showRowHover: true,
      selectable: false,
      multiSelectable: false,
      canSelectAll: false,
      deselectOnClickaway: true,
      data: {}
    };
  },

  componentDidMount: function () {

    // sample
    let data = {
      'Ojbect': {
        "averageItemLevel": 705,
        "averageItemLevelEquipped": 700,
        "attendance": 84,
        items: [
          {
            "type": "LOOT",
            "timestamp": 1438144794000,
            "itemId": 124635,
            "context": "vendor",
            "bonusLists": [
            621,
            649
            ]
            },
            {
            "type": "LOOT",
            "timestamp": 1438144173000,
            "itemId": 124638,
            "context": "quest-reward",
            "bonusLists": [
            621,
            650
            ]
          }
        ]
      }
    };

    this.setState({data: data});
  },

  ILVL_THRESHOLD: 680, //TODO this would have to be hard-coded per raid tier

  getItemLevel: function () {

  },

  getCharacterData: function (region, realm, characterName) {
    // 1. ITEM LEVEL
    let handleItemLevelError = function(characterName, responseData) {
      console.log('Could not get ilvl from ' + characterName + ': ' + JSON.stringify(responseData) + ', so character is removed from output. ');
      let newData = self.state.data;
      delete newData[characterName];
      self.setState({data: newData});
    };

    $.getJSON(
      Server.buildUrl('items', region, realm, characterName),
      function(responseData) {
        if (responseData.items && responseData.items.averageItemLevel) {
          let newData = self.state.data;
          let dude = newData[characterName];
          let ilvl = responseData.items.averageItemLevel;
          // TODO change threshold, or remove it altogether
          if (ilvl < self.ILVL_THRESHOLD) {
            delete newData[characterName];
          }
          else {
            dude.averageItemLevel = responseData.items.averageItemLevel;
            dude.averageItemLevelEquipped = responseData.items.averageItemLevelEquipped;
          }
          // re-render
          self.setState({data: newData});

          // 2. RECENT LOOT
          let lootPath = Server.mergeUrlQuery(
            Server.buildUrl('feed', region, realm, characterName),
            {
              daysAgo: p.days,
              filter: 'loot'
            }
          );

          $.getJSON(
            lootPath,
            function(responseData) {
              if (Array.isArray(responseData.feed)) {
                // Filter raid loot
                let loot = responseData.feed.filter(function(element) {
                  //TODO
                  return true;
                });
                //TODO
              }
            }
          );
        }
        else {
          handleItemLevelError(characterName, responseData);
        }
      }
    ).fail(function(response) {
      handleItemLevelError(characterName, response);
    });
  },

  // Called whenever new props are set, except the initial time
  componentWillReceiveProps: function (nextProps) {
    self = this;

    let p = nextProps;
    console.log(p)
    let realm = p.realm;
    let region = p.region;
    let roster = p.roster;

    let data = {};
    roster.forEach(function (element, index, array) {
      // element is the character's name

      // Initial state is empty, waiting for responses to update data
      let dude = {
        "averageItemLevel": 0,
        "averageItemLevelEquipped": 0,
        "attendance": 0,
        items: []
      };
      data[element] = dude;
    });

    self.setState({data: data});


    for (let characterName in data) {
      getCharacterData(region, realm, characterName);
    }
  },

  render: function() {

    let rows = this.makeRows(this.state.data);

    let timePeriod = '';
    if (this.props.days > 0) {
      timePeriod = ' in ' + this.props.days + ' days';
    }
    else {
      timePeriod = ' this week';
    }

    // Column configuration
    let headerCols = {
      name: {
        content: 'Name',
        tooltip: 'Character name'
      },
      ilvl: {
        content: 'ilvl',
        tooltip: 'Item level (average/equipped)'
      },
      attendance: {
        content: 'Attendance',
        tooltip: 'Percentage attendance' + timePeriod
      },
      loot: {
        content: 'Loot',
        tooltip: 'Items received from current raid tier' + timePeriod
      }
    };

    let colOrder = ['attendance', 'name', 'ilvl', 'loot'];

    let table = React.createElement(Table, {
      headerColumns: headerCols,
      columnOrder: colOrder,
      displayRowCheckbox: false,
      displaySelectAll: false,
      rowData: rows,
      fixedHeader: this.state.fixedHeader,
      fixedFooter: this.state.fixedFooter,
      stripedRows: this.state.stripedRows,
      showRowHover: this.state.showRowHover,
      onRowSelection: this._onRowSelection
    });

    return (
      <div>
        {table}
      </div>
    );
  },

  _onRowSelection: function() {
    // Do nothing at the moment.
    console.log('_onRowSelection');
  }

});

module.exports = GuildSummary;
