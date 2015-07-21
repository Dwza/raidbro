
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
  'us': 'Americas',
  'eu': 'Europe',
  'cn': 'Asia',
  'kr': 'Korea',
  'tw': 'Taiwan'
};

module.exports = Wow;
