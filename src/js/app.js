// INFO + CONTEXT

// Terminals in the Fallout francise include a gameplay mechanic/minigame "Hacking" to unlock the terminals. The game has similariies to the board game "Mastermind",
// Terminals work similarly across Fallout 3, Fallout New Vegas, Fallout 4 and Fallout 76 - for this project I am basing the terminal off of the Fallout 4 game.
// In game, terminals have two columns which each have 16 rows of 12 characters. Each row always starts with a randomised hexadecimal number.
// These rows are mainly made up of random special characters, with potential passwords scattered throughout
// The number and length of the potential passwords is dependant on the characters intelligence statistic and the difficulty level of the terminal
// The password length is capped at 12 and the frequency at 20. Generally speaking the higher the intelligence, the fewer potential passwords and the shorter they are
// You get four attempts to guess the password and each guess returns a "Likeness" output, similar to Wordle, which is a number that refers to the number of letters that align with the correct password
// Finding complete sets of brackets within the garble on one row either removes incorrect/dud words or resets your attempts
// Successfully hacking a terminal may allow one to: access information, disable or enable turrets or spotlights, alarm systems, and various other defenses or traps, open locked doors or safes.

// VARS + GLOBALS

const SPECIAL_CHARACTERS = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "[",
  "]",
  "{",
  "}",
  "<",
  ">",
  "|",
  "'",
  ";",
  ":",
  "/",
  "?",
  ",",
  ".",
  ";",
];

const TOTAL_CHARACTERS_PER_ROW = 12;
const TOTAL_ROWS = 32;

const PASSWORD_LENGTH = 5;
const PASSWORD_FREQUENCY = 20;

// UTIL FUNCTIONS

/**
 * Shuffles an array in-place using the Fisher-Yates shuffle algorithm.
 *
 * @param {number[]} array - The input array to be shuffled.
 * @returns {number[]} The same shuffled array.
 * @see https://bost.ocks.org/mike/shuffle/
 */
const fisherYatesShuffle = (array) => {
  let m = array.length;

  // While there are elements left to shuffle where m represents the remaining elements left to shuffle
  while (m) {
    // Pick a random remaining element
    const index = randomNumberGenerator(m--);

    // Swap it with the current element to shuffle the array in-place
    [array[m], array[index]] = [array[index], array[m]];
  }

  // Return the shuffled array in O(max) time
  return array;
};

/**
 * Generates a random number from 0 to max
 *
 * @param {number} max - The maximum number to generate
 * @returns {number} A random number from 0 to max
 * @throws {Error} If the max is not a positive numerical value.
 */
const randomNumberGenerator = (max) => {
  if (!Number.isFinite(max) || max <= 0) {
    throw new Error("Length must be a non-negative non-zero numerical value");
  }

  return Math.floor(Math.random() * max);
};

/**
 * Generates an array of random numbers from 0 to max
 *
 * @param {number} max - The maximum number to generate
 * @param {number} length - The maximum numbers to generate
 * @returns {number[]} A random array of numbers matching length
 */
const multipleRandomNumberGenerator = (max, length) => {
  if (length < 0)
    throw new Error("Length must be a non-negative non-zero number");

  if (max < length)
    throw new Error(`Cannot get ${n} distinct values from ${max} options!`);

  // Generate an array of values from 0 to max (this ensures that there won't be any duplicate values)

  let values = [];

  for (let i = 0; i < max; i++) {
    values.push(i);
  }

  values = fisherYatesShuffle(values);

  // Return only a chunk of the values matching length
  return values.slice(0, length);
};

/**
 * Generates an array of random special characters.
 *
 * @param {number} length - The number of characters to generate.
 * @returns {string[]} An array of random special characters.
 * @throws {Error} If the length is not a positive numerical value.
 */
const generateGarble = (length) => {
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error("Length must be a non-negative non-zero numerical value");
  }

  const garble = Array.from(
    { length: length },
    () => SPECIAL_CHARACTERS[randomNumberGenerator(SPECIAL_CHARACTERS.length)],
  );

  return garble;
};

// MAIN FUNCTIONS

const generateHackablePuzzle = () => {
  // Generate an array of length 384 filled wth special characters for the bulk of the puzzle
  const garble = generateGarble(TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW);

  // Generate an array of unqiue random index positions from 0 to 384 for the positions of the passwords within the puzzle
  const passwordPositions = multipleRandomNumberGenerator(
    TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW,
    PASSWORD_FREQUENCY,
  );

  console.log(garble, passwordPositions);
};

// Initialize the terminal on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  generateHackablePuzzle();
});
