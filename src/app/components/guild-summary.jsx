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

      let attendance = info.attendance;

      let loot = info.items.map(function (i) {
        let href = "http://www.wowhead.com/item=" + i.itemId;
        return (
          <div>
            <a target="_blank" href={href} rel={'bonus=' + i.bonusLists.join(':')}>{i.timestamp}</a> {i.context}
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
    this.getAttendance(
      this.props.region,
      this.props.realm,
      this.props.guild
    );

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

  handleItemLevelError: function(characterName, responseData) {
    console.log('Could not get ilvl from ' + characterName + ': ' + JSON.stringify(responseData) + ', so character is removed from output. ');
    let newData = self.state.data;
    delete newData[characterName];
    self.setState({data: newData});
  },

  getCharacterData: function (region, realm, characterName) {
    let self = this;

    // 1. ITEM LEVEL
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
              daysAgo: self.props.days,
              filter: 'loot'
            }
          );

          $.getJSON(
            lootPath,
            function(responseData) {
              let lootList = responseData.feed;
              if (Array.isArray(lootList)) {
                // Filter raid loot
                let loot = lootList.filter(function(element) {
                  //TODO
                  return true;
                });
                //TODO

                dude.items = lootList;
                self.setState({data: newData});
              }
            }
          );
        }
        else {
          self.handleItemLevelError(characterName, responseData);
        }
      }
    ).fail(function(response) {
      self.handleItemLevelError(characterName, response);
    });
  },


  // Recurse through a list of reports
  getJsonSync: function (generatePath, processResponse, finish, list) {
    let self = this;

    console.log('remaining list: ' + JSON.stringify(list));
    if (!list.length) {
      finish();
      return;
    }


    let current = list.shift(); // remove 1st element

    $.getJSON(
      generatePath(current),
      function (responseData) {
        processResponse(responseData);
        self.getJsonSync(generatePath, processResponse, finish, list);
      }
    );
  },


  getAttendance: function(region, realm, guildName) {
    let self = this;

    // Attendance is based on data from warcraftlogs.com
    let path = Server.mergeUrlQuery(
      Server.buildUrl('reports', region, realm, guildName),
      {
        daysAgo: self.props.days
      }
    );
    console.log('GET ' + path);
    $.getJSON(
      path,
      function(responseData) {
        if (Array.isArray(responseData)) {

          let reports = responseData.filter(function (element) {
            // TODO dynamically verify the correct zone (i.e. current tier's raid)
            return 'Hellfire Citadel' === element.title;
          });

          console.log('Reports ' + JSON.stringify(responseData));

          let attendance = {
            // 'Slimshady': 3 nights attended
            totalShowings: reports.length // count of all nights logged
          };

          self.getJsonSync(
            function generatePath(report) {
              let path = Server.buildUrl('fights', report.id);
              console.log('GET ' + path);
              return path;
            },
            function onResponse(responseData) {
              let attendees = responseData.friendlies;
              console.log(responseData);
              if (attendees && Array.isArray(attendees)) {
                attendees.forEach(function (attendee) {
                  let name = attendee.name;
                  if ('string' === typeof name) {
                    if (attendance[name]) {
                      attendance[name]++;
                    }
                    else {
                      attendance[name] = 1;
                    }
                  }
                });
              }
            },
            function onFinish() {
              console.log('attendance: ' + JSON.stringify(attendance));
              self.setState({
                attendanceReady: true,
                attendance: attendance
              });
            },
            reports
          );
        }
      }
    )
    .fail(function(response){
      console.log(response);
    });
  },


  // Called whenever new props are set, except the initial time
  componentWillReceiveProps: function (nextProps) {
    self = this;

    let p = nextProps;
    let realm = p.realm;
    let region = p.region;
    let roster = p.roster;
    let guild = p.guild;

    let data = {};
    roster.forEach(function (element, index, array) {
      let characterName = element;

      // Initialize each guild member's info
      let dude = {
        "averageItemLevel": 0,
        "averageItemLevelEquipped": 0,
        "attendance": 0,
        items: []
      };
      data[characterName] = dude;
    });

    self.setState({data: data});

    // Populate the character information asynchronously
    for (let characterName in data) {
      this.getCharacterData(region, realm, characterName);
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

  componentDidUpdate: function() {
    // Check if there are wowhead links that have not been processed.
    var links = $('a').toArray().filter(function(element) {
      return element.hasAttribute('href') && -1 !== element.href.indexOf('wowhead') && !element.hasAttribute('style');
    });

    if (links && 0 < links.length) {
      $WowheadPower.refreshLinks();
    }
  },

  _onRowSelection: function() {
    // Do nothing at the moment.
    console.log('_onRowSelection');
  }

});

module.exports = GuildSummary;
