/**
 * Question Pools for Mini-Games
 * Age-adaptive difficulty: easy (7-9), medium (10-12), hard (13-17)
 */

// ==================== SPEED MATH ====================

export const speedMathQuestions = {
  easy: [
    { question: "5 + 3", answer: 8, type: "number" },
    { question: "10 - 4", answer: 6, type: "number" },
    { question: "6 + 7", answer: 13, type: "number" },
    { question: "15 - 8", answer: 7, type: "number" },
    { question: "9 + 6", answer: 15, type: "number" },
    { question: "12 - 5", answer: 7, type: "number" },
    { question: "8 + 8", answer: 16, type: "number" },
    { question: "20 - 12", answer: 8, type: "number" },
    { question: "7 + 9", answer: 16, type: "number" },
    { question: "14 - 6", answer: 8, type: "number" },
    { question: "3 × 4", answer: 12, type: "number" },
    { question: "2 × 8", answer: 16, type: "number" },
    { question: "5 × 3", answer: 15, type: "number" },
    { question: "6 × 2", answer: 12, type: "number" },
    { question: "4 × 5", answer: 20, type: "number" }
  ],
  medium: [
    { question: "7 × 8", answer: 56, type: "number" },
    { question: "9 × 6", answer: 54, type: "number" },
    { question: "12 × 5", answer: 60, type: "number" },
    { question: "8 × 9", answer: 72, type: "number" },
    { question: "45 ÷ 5", answer: 9, type: "number" },
    { question: "64 ÷ 8", answer: 8, type: "number" },
    { question: "36 ÷ 6", answer: 6, type: "number" },
    { question: "25 + 37", answer: 62, type: "number" },
    { question: "83 - 46", answer: 37, type: "number" },
    { question: "54 + 29", answer: 83, type: "number" },
    { question: "11 × 7", answer: 77, type: "number" },
    { question: "13 × 6", answer: 78, type: "number" },
    { question: "72 ÷ 9", answer: 8, type: "number" },
    { question: "96 ÷ 12", answer: 8, type: "number" },
    { question: "15 × 4", answer: 60, type: "number" }
  ],
  hard: [
    { question: "17 × 13", answer: 221, type: "number" },
    { question: "144 ÷ 12", answer: 12, type: "number" },
    { question: "23 × 8", answer: 184, type: "number" },
    { question: "156 ÷ 13", answer: 12, type: "number" },
    { question: "19 × 15", answer: 285, type: "number" },
    { question: "324 ÷ 18", answer: 18, type: "number" },
    { question: "127 + 386", answer: 513, type: "number" },
    { question: "645 - 287", answer: 358, type: "number" },
    { question: "25 × 16", answer: 400, type: "number" },
    { question: "420 ÷ 21", answer: 20, type: "number" },
    { question: "38 × 12", answer: 456, type: "number" },
    { question: "256 ÷ 16", answer: 16, type: "number" },
    { question: "754 + 298", answer: 1052, type: "number" },
    { question: "892 - 467", answer: 425, type: "number" },
    { question: "45 × 11", answer: 495, type: "number" }
  ]
};

// ==================== TRIVIA ====================

export const triviaQuestions = {
  easy: [
    {
      question: "What color is Santa's suit?",
      options: ["Red", "Blue", "Green", "Yellow"],
      answer: "Red"
    },
    {
      question: "How many reindeer pull Santa's sleigh?",
      options: ["6", "8", "10", "12"],
      answer: "8"
    },
    {
      question: "What month is Christmas in?",
      options: ["November", "December", "January", "February"],
      answer: "December"
    },
    {
      question: "What do you hang on a Christmas tree?",
      options: ["Ornaments", "Books", "Shoes", "Hats"],
      answer: "Ornaments"
    },
    {
      question: "What pulls Santa's sleigh?",
      options: ["Horses", "Dogs", "Reindeer", "Cats"],
      answer: "Reindeer"
    },
    {
      question: "Where does Santa live?",
      options: ["South Pole", "North Pole", "Antarctica", "Alaska"],
      answer: "North Pole"
    },
    {
      question: "What do kids leave out for Santa?",
      options: ["Pizza", "Salad", "Cookies", "Soup"],
      answer: "Cookies"
    },
    {
      question: "What do you build with snow?",
      options: ["Sandcastle", "Snowman", "Treehouse", "Castle"],
      answer: "Snowman"
    },
    {
      question: "What color is Rudolph's nose?",
      options: ["Blue", "Red", "Green", "Yellow"],
      answer: "Red"
    },
    {
      question: "What falls from the sky in winter?",
      options: ["Rain", "Snow", "Leaves", "Sand"],
      answer: "Snow"
    }
  ],
  medium: [
    {
      question: "What is the name of the reindeer with a red nose?",
      options: ["Dasher", "Dancer", "Rudolph", "Comet"],
      answer: "Rudolph"
    },
    {
      question: "In which country did the Christmas tree tradition originate?",
      options: ["France", "England", "Germany", "Italy"],
      answer: "Germany"
    },
    {
      question: "What is Santa's real name?",
      options: ["St. Nicholas", "St. Patrick", "St. George", "St. Andrew"],
      answer: "St. Nicholas"
    },
    {
      question: "How many days are in the '12 Days of Christmas' song?",
      options: ["10", "11", "12", "13"],
      answer: "12"
    },
    {
      question: "What plant do people kiss under at Christmas?",
      options: ["Holly", "Ivy", "Mistletoe", "Pine"],
      answer: "Mistletoe"
    },
    {
      question: "What is the first reindeer named in 'The Night Before Christmas'?",
      options: ["Dasher", "Rudolph", "Prancer", "Vixen"],
      answer: "Dasher"
    },
    {
      question: "In 'Home Alone', where does Kevin's family go on vacation?",
      options: ["London", "Paris", "Rome", "Tokyo"],
      answer: "Paris"
    },
    {
      question: "What color are mistletoe berries?",
      options: ["Red", "White", "Green", "Blue"],
      answer: "White"
    },
    {
      question: "How many ghosts visit Scrooge in 'A Christmas Carol'?",
      options: ["2", "3", "4", "5"],
      answer: "4"
    },
    {
      question: "What Christmas decoration was originally made from silver?",
      options: ["Ornaments", "Tinsel", "Lights", "Garland"],
      answer: "Tinsel"
    }
  ],
  hard: [
    {
      question: "In what year was the first Christmas card sent?",
      options: ["1843", "1863", "1883", "1903"],
      answer: "1843"
    },
    {
      question: "Which country started the tradition of putting up a Christmas tree?",
      options: ["Austria", "Germany", "Switzerland", "Norway"],
      answer: "Germany"
    },
    {
      question: "In the song '12 Days of Christmas', what are there 11 of?",
      options: ["Lords a-leaping", "Pipers piping", "Drummers drumming", "Ladies dancing"],
      answer: "Pipers piping"
    },
    {
      question: "What is the best-selling Christmas single of all time?",
      options: ["Jingle Bells", "White Christmas", "Silent Night", "Last Christmas"],
      answer: "White Christmas"
    },
    {
      question: "In which modern-day country was Saint Nicholas born?",
      options: ["Greece", "Turkey", "Italy", "Egypt"],
      answer: "Turkey"
    },
    {
      question: "What are the names of all 9 of Santa's reindeer (including Rudolph)?",
      options: ["Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner, Blitzen, Rudolph", "Only 8 reindeer exist", "Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Thunder, Lightning, Rudolph", "None of the above"],
      answer: "Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner, Blitzen, Rudolph"
    },
    {
      question: "What does 'Noel' mean in Latin?",
      options: ["Birth", "Joy", "Peace", "Snow"],
      answer: "Birth"
    },
    {
      question: "In what decade did Coca-Cola start using Santa Claus in ads?",
      options: ["1910s", "1920s", "1930s", "1940s"],
      answer: "1920s"
    },
    {
      question: "Which fairy tale inspired the first gingerbread houses?",
      options: ["Cinderella", "Hansel and Gretel", "Snow White", "Sleeping Beauty"],
      answer: "Hansel and Gretel"
    },
    {
      question: "What is the chemical formula for snow?",
      options: ["H2O", "CO2", "H2O2", "NaCl"],
      answer: "H2O"
    }
  ]
};

// ==================== TRUE/FALSE ====================

export const trueFalseQuestions = {
  easy: [
    { question: "Santa wears a red suit", answer: true },
    { question: "Christmas is in December", answer: true },
    { question: "Reindeer can fly", answer: true }, // In Christmas magic!
    { question: "Snowmen are made of sand", answer: false },
    { question: "Elves help Santa", answer: true },
    { question: "Christmas trees are usually pine trees", answer: true },
    { question: "Santa lives at the South Pole", answer: false },
    { question: "You leave carrots for reindeer", answer: true },
    { question: "Stockings are hung by the fireplace", answer: true },
    { question: "Snow is hot", answer: false },
    { question: "Rudolph has a red nose", answer: true },
    { question: "Santa delivers presents on Christmas Eve", answer: true },
    { question: "Candy canes are shaped like a J", answer: true },
    { question: "Snowflakes are all exactly the same", answer: false },
    { question: "Jingle bells make sound", answer: true }
  ],
  medium: [
    { question: "There are 8 reindeer pulling Santa's sleigh (not counting Rudolph)", answer: true },
    { question: "Mistletoe berries are red", answer: false }, // They're white
    { question: "The Grinch's heart grew three sizes", answer: true },
    { question: "Christmas was originally a pagan holiday", answer: true },
    { question: "Eggnog contains eggs", answer: true },
    { question: "Frosty the Snowman had a button nose", answer: true },
    { question: "The North Pole is in Canada", answer: false },
    { question: "Candy canes were originally straight", answer: true },
    { question: "Santa checks his list twice", answer: true },
    { question: "All snowflakes have 6 sides", answer: true },
    { question: "Jingle Bells was originally a Thanksgiving song", answer: true },
    { question: "The tallest Christmas tree ever was over 200 feet", answer: true },
    { question: "Poinsettias are native to Mexico", answer: true },
    { question: "Christmas crackers were invented in China", answer: false }, // Invented in England
    { question: "The word 'Christmas' means 'Christ's Mass'", answer: true }
  ],
  hard: [
    { question: "The first artificial Christmas tree was made in Germany using goose feathers", answer: true },
    { question: "Jingle Bells was the first song played in space", answer: true },
    { question: "The tradition of Christmas caroling began in England", answer: true },
    { question: "Santa Claus is based on a real person", answer: true }, // St. Nicholas
    { question: "Rudolph was created by a department store", answer: true }, // Montgomery Ward
    { question: "The North Pole has polar bears", answer: true },
    { question: "Silent Night was first performed on a broken organ", answer: true },
    { question: "Christmas was banned in England for a period in history", answer: true },
    { question: "The abbreviation 'Xmas' is disrespectful", answer: false }, // X is Greek chi
    { question: "More diamonds are sold in December than any other month", answer: true },
    { question: "The largest gingerbread house weighed over a ton", answer: true },
    { question: "Electric Christmas lights were invented by Thomas Edison's assistant", answer: true },
    { question: "Mistletoe is a parasite plant", answer: true },
    { question: "The modern image of Santa was created by Coca-Cola", answer: false }, // Popularized, not created
    { question: "Boxing Day originated from giving boxes to servants", answer: true }
  ]
};

// ==================== SPELLING ====================

export const spellingQuestions = {
  easy: [
    { word: "SANTA", scrambled: "TAANS" },
    { word: "SNOW", scrambled: "WONS" },
    { word: "GIFT", scrambled: "TFIG" },
    { word: "TREE", scrambled: "ERTE" },
    { word: "STAR", scrambled: "RATS" },
    { word: "BELL", scrambled: "LEBL" },
    { word: "SLED", scrambled: "LEDS" },
    { word: "TOYS", scrambled: "YOST" },
    { word: "WISH", scrambled: "HISW" },
    { word: "COLD", scrambled: "DCOL" },
    { word: "CAKE", scrambled: "KACE" },
    { word: "SOCK", scrambled: "KOSC" },
    { word: "CARD", scrambled: "DRAC" },
    { word: "MILK", scrambled: "KILM" },
    { word: "WINTER", scrambled: "TWINRE" }
  ],
  medium: [
    { word: "REINDEER", scrambled: "EEDREINR" },
    { word: "STOCKING", scrambled: "GKISCONT" },
    { word: "MISTLETOE", scrambled: "SEMITLOET" },
    { word: "SNOWMAN", scrambled: "WOSNAMN" },
    { word: "CHIMNEY", scrambled: "HYCMIEN" },
    { word: "SLEIGH", scrambled: "GHIELS" },
    { word: "ORNAMENT", scrambled: "MANRONET" },
    { word: "BLIZZARD", scrambled: "ZIBZRADL" },
    { word: "GINGERBREAD", scrambled: "DERBGNAIGRE" },
    { word: "CELEBRATE", scrambled: "RATEELCEB" },
    { word: "PRESENT", scrambled: "PERNETS" },
    { word: "DECEMBER", scrambled: "CREBMEDE" },
    { word: "HOLIDAY", scrambled: "LOAYDHI" },
    { word: "WORKSHOP", scrambled: "HKRWOPOS" },
    { word: "FESTIVAL", scrambled: "TVFAISEL" }
  ],
  hard: [
    { word: "FRANKINCENSE", scrambled: "KSECENANFRIN" },
    { word: "GINGERBREAD", scrambled: "DERBGNAIGRE" },
    { word: "NUTCRACKER", scrambled: "TUCREKCANR" },
    { word: "PEPPERMINT", scrambled: "TEPMREPPNI" },
    { word: "POINSETTIA", scrambled: "NOIAPTTSEI" },
    { word: "PARTRIDGE", scrambled: "RTGPIEARD" },
    { word: "WREATH", scrambled: "THWARE" },
    { word: "SNOWFLAKE", scrambled: "LKASFWONE" },
    { word: "TRADITION", scrambled: "DITOINART" },
    { word: "ANTICIPATION", scrambled: "OTATNIINIAPC" },
    { word: "FRANKINCENSE", scrambled: "KSECENANFRIN" },
    { word: "ILLUMINATION", scrambled: "NITOIALILUMN" },
    { word: "MAGNIFICENCE", scrambled: "EECCMNGFINIA" },
    { word: "SPECTACULAR", scrambled: "TCLUSACPEAR" },
    { word: "WONDERLAND", scrambled: "DALWONREND" }
  ]
};

// ==================== COLOR PATTERN MATCH ====================

export const colorPatternQuestions = {
  easy: [
    { pattern: ["red", "green"], options: [["red", "green"], ["green", "red"], ["blue", "yellow"], ["red", "blue"]], answer: ["red", "green"] },
    { pattern: ["blue", "blue"], options: [["blue", "blue"], ["red", "red"], ["blue", "red"], ["green", "blue"]], answer: ["blue", "blue"] },
    { pattern: ["green", "red", "green"], options: [["green", "red", "green"], ["red", "green", "red"], ["green", "green", "red"], ["blue", "red", "green"]], answer: ["green", "red", "green"] },
    { pattern: ["red", "blue", "red"], options: [["red", "blue", "red"], ["blue", "red", "blue"], ["red", "red", "blue"], ["blue", "blue", "red"]], answer: ["red", "blue", "red"] },
    { pattern: ["yellow", "yellow", "yellow"], options: [["yellow", "yellow", "yellow"], ["green", "green", "green"], ["yellow", "green", "yellow"], ["red", "yellow", "yellow"]], answer: ["yellow", "yellow", "yellow"] }
  ],
  medium: [
    { pattern: ["red", "green", "red", "green"], options: [["red", "green", "red", "green"], ["green", "red", "green", "red"], ["red", "red", "green", "green"], ["blue", "green", "red", "green"]], answer: ["red", "green", "red", "green"] },
    { pattern: ["blue", "yellow", "blue", "yellow", "blue"], options: [["blue", "yellow", "blue", "yellow", "blue"], ["yellow", "blue", "yellow", "blue", "yellow"], ["blue", "blue", "yellow", "blue", "blue"], ["red", "yellow", "blue", "yellow", "blue"]], answer: ["blue", "yellow", "blue", "yellow", "blue"] },
    { pattern: ["red", "red", "blue", "blue"], options: [["red", "red", "blue", "blue"], ["blue", "blue", "red", "red"], ["red", "blue", "red", "blue"], ["green", "red", "blue", "blue"]], answer: ["red", "red", "blue", "blue"] },
    { pattern: ["green", "blue", "green", "blue", "green", "blue"], options: [["green", "blue", "green", "blue", "green", "blue"], ["blue", "green", "blue", "green", "blue", "green"], ["green", "green", "blue", "blue", "green", "blue"], ["red", "blue", "green", "blue", "green", "blue"]], answer: ["green", "blue", "green", "blue", "green", "blue"] },
    { pattern: ["yellow", "red", "yellow", "red", "yellow"], options: [["yellow", "red", "yellow", "red", "yellow"], ["red", "yellow", "red", "yellow", "red"], ["yellow", "yellow", "red", "red", "yellow"], ["blue", "red", "yellow", "red", "yellow"]], answer: ["yellow", "red", "yellow", "red", "yellow"] }
  ],
  hard: [
    { pattern: ["red", "blue", "green", "red", "blue", "green"], options: [["red", "blue", "green", "red", "blue", "green"], ["green", "blue", "red", "green", "blue", "red"], ["red", "red", "blue", "green", "blue", "green"], ["yellow", "blue", "green", "red", "blue", "green"]], answer: ["red", "blue", "green", "red", "blue", "green"] },
    { pattern: ["blue", "blue", "green", "green", "red", "red"], options: [["blue", "blue", "green", "green", "red", "red"], ["red", "red", "green", "green", "blue", "blue"], ["blue", "green", "blue", "green", "red", "red"], ["blue", "blue", "red", "green", "red", "red"]], answer: ["blue", "blue", "green", "green", "red", "red"] },
    { pattern: ["yellow", "green", "blue", "yellow", "green", "blue", "yellow"], options: [["yellow", "green", "blue", "yellow", "green", "blue", "yellow"], ["blue", "green", "yellow", "blue", "green", "yellow", "blue"], ["yellow", "yellow", "green", "blue", "green", "blue", "yellow"], ["red", "green", "blue", "yellow", "green", "blue", "yellow"]], answer: ["yellow", "green", "blue", "yellow", "green", "blue", "yellow"] },
    { pattern: ["red", "green", "green", "red", "green", "green", "red"], options: [["red", "green", "green", "red", "green", "green", "red"], ["green", "red", "red", "green", "red", "red", "green"], ["red", "red", "green", "green", "red", "green", "red"], ["blue", "green", "green", "red", "green", "green", "red"]], answer: ["red", "green", "green", "red", "green", "green", "red"] },
    { pattern: ["blue", "yellow", "red", "blue", "yellow", "red", "blue", "yellow"], options: [["blue", "yellow", "red", "blue", "yellow", "red", "blue", "yellow"], ["red", "yellow", "blue", "red", "yellow", "blue", "red", "yellow"], ["blue", "blue", "yellow", "red", "yellow", "red", "blue", "yellow"], ["green", "yellow", "red", "blue", "yellow", "red", "blue", "yellow"]], answer: ["blue", "yellow", "red", "blue", "yellow", "red", "blue", "yellow"] }
  ]
};

// ==================== MEMORY MATCH ====================

export const memoryMatchCards = {
  easy: [
    { id: 1, image: "🎅", name: "Santa" },
    { id: 2, image: "🎄", name: "Tree" },
    { id: 3, image: "🎁", name: "Gift" },
    { id: 4, image: "⭐", name: "Star" },
    { id: 5, image: "🔔", name: "Bell" },
    { id: 6, image: "❄️", name: "Snowflake" }
  ],
  medium: [
    { id: 1, image: "🎅", name: "Santa" },
    { id: 2, image: "🎄", name: "Tree" },
    { id: 3, image: "🎁", name: "Gift" },
    { id: 4, image: "⭐", name: "Star" },
    { id: 5, image: "🔔", name: "Bell" },
    { id: 6, image: "❄️", name: "Snowflake" },
    { id: 7, image: "🦌", name: "Reindeer" },
    { id: 8, image: "🍪", name: "Cookie" }
  ],
  hard: [
    { id: 1, image: "🎅", name: "Santa" },
    { id: 2, image: "🎄", name: "Tree" },
    { id: 3, image: "🎁", name: "Gift" },
    { id: 4, image: "⭐", name: "Star" },
    { id: 5, image: "🔔", name: "Bell" },
    { id: 6, image: "❄️", name: "Snowflake" },
    { id: 7, image: "🦌", name: "Reindeer" },
    { id: 8, image: "🍪", name: "Cookie" },
    { id: 9, image: "🎀", name: "Ribbon" },
    { id: 10, image: "🕯️", name: "Candle" }
  ]
};

/**
 * Get questions for a specific game type and difficulty
 */
export function getQuestions(gameType, difficulty, count = 1) {
  const pools = {
    'speed-math': speedMathQuestions,
    'trivia': triviaQuestions,
    'true-false': trueFalseQuestions,
    'spelling': spellingQuestions,
    'color-pattern': colorPatternQuestions,
    'memory-match': memoryMatchCards
  };

  const pool = pools[gameType];
  if (!pool || !pool[difficulty]) {
    console.error(`No questions found for ${gameType} at ${difficulty} difficulty`);
    return [];
  }

  // Shuffle and return requested count
  const shuffled = [...pool[difficulty]].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Map age to difficulty level
 */
export function getDifficultyForAge(age) {
  if (age <= 9) return 'easy';
  if (age <= 12) return 'medium';
  return 'hard';
}

export default {
  speedMathQuestions,
  triviaQuestions,
  trueFalseQuestions,
  spellingQuestions,
  colorPatternQuestions,
  memoryMatchCards,
  getQuestions,
  getDifficultyForAge
};
