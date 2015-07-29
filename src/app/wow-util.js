'use strict';

var Wow = {};

// Item variations
Wow.BONUS = {
  // raid version of the item
  NORMAL: 0,
  HEROIC: 566,
  MYTHIC: 567,
  WARFORGED: {
    NORMAL: 560,
    HEROIC: 561,
    MYTHIC: 562
  },
  SOCKET: {
    NORMAL: 563,
    HEROIC: 564,
    MYTHIC: 565
  },
  AVOIDANCE: 40,
  LEECH: 41,
  SPEED: 42,
  INDESTRUCTIBLE: 43
}

Wow.REGIONS = {
  'us': 'Americas', // usually default
  'eu': 'Europe'
};

/**
 * @brief Returns a list of character names from the roster
 */
Wow.parseRoster = function (roster, rankLimit) {

  var eligibleMembers = [];

  if (roster.members) {
    let members = roster.members;

    if ('number' === typeof rankLimit) {
      members = members.filter( function (member) {
        return member.rank <= rankLimit;
      });
    }

    eligibleMembers = members.map(function (member) {
      return member.character.name;
    });
  }

  return eligibleMembers;
};


module.exports = Wow;
