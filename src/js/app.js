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

// VARS + GLOBALS + IMPORTS

import { generate } from "random-words";

const terminalScreen = document.getElementById("output");

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
 * Generates a random number from min (inclusive) to max (inclusive)
 *
 * @param {number} max - The maximum number to generate
 * @param {number} min - The minimum number to generate
 * @returns {number} A random number from 0 to max
 * @throws {Error} If the max is not a positive numerical value.
 */
const randomNumberGenerator = (max, min = 0) => {
  if (!Number.isFinite(max) || max <= 0) {
    throw new Error(
      "Maximum value must be a non-negative non-zero numerical value",
    );
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates an array of random numbers from 0 to max
 *
 * @param {number} max - The maximum number to generate
 * @param {number} length - The maximum numbers to generate
 * @param {number} [minDifference = 0] - The minimum difference between each number.
 * @returns {number[]} A random array of numbers matching length
 */
const multipleRandomNumberGenerator = (max, length, minDifference = 0) => {
  if (length < 0)
    throw new Error("Length must be a non-negative non-zero number");

  if (max < length)
    throw new Error(
      `Cannot get ${length} distinct values from ${max} options!`,
    );

  // Use a set to avoid duplicate values
  const values = new Set();

  // While the set is not fully populated
  while (values.size < length) {
    // Generate random values to add to it
    const randomValue = randomNumberGenerator(max);

    // Ensure the minDifference spacing is respected before adding values
    if (
      [...values].every(
        (value) => Math.abs(value - randomValue) >= minDifference,
      )
    ) {
      values.add(randomValue);
    }
  }

  // Return an array of spaced values
  return [...values];
};

/**
 * Generates an array of random words of a given length
 *
 * @param {number} max - The maximum number of words to generate
 * @param {number} length - The length of the words
 * @returns {string[]} An array of words
 */
const generateRandomWords = (max, length) =>
  generate({ exactly: max, minLength: length, maxLength: length });

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
    () =>
      SPECIAL_CHARACTERS[randomNumberGenerator(SPECIAL_CHARACTERS.length - 1)],
  );

  return garble;
};

// MAIN FUNCTIONS

const generateHackablePuzzle = () => {
  // Generate an array of length 384 filled wth special characters for the bulk/base of the puzzle output
  const output = generateGarble(TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW);

  // Generate an array of unqiue random index positions from 0 to 384 - password length (so no password gets cut off) for the positions of the passwords within the puzzle
  const passwordPositions = multipleRandomNumberGenerator(
    TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW - PASSWORD_LENGTH,
    PASSWORD_FREQUENCY,
    PASSWORD_LENGTH + 1,
  );

  // Generate 20 random 5 letters words to act as either the password or dud
  const passwords = generateRandomWords(PASSWORD_FREQUENCY, PASSWORD_LENGTH);

  // Use the passwords and their randomly generated positions to add them into the output
  for (let i = 0; i < passwordPositions.length; i++) {
    const targetIndex = passwordPositions[i];
    const targetPassword = passwords[i];

    // Add each individual letter of the password to the array by splitting it up and deleting one character from the array to maintain the 384 length
    for (let j = 0; j < targetPassword.length; j++) {
      output.splice(targetIndex + j, 1, targetPassword[j]);
    }
  }

  return output;
};

const displayPuzzle = (puzzle) => {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < puzzle.length; i += TOTAL_CHARACTERS_PER_ROW) {
    // Extract a row of characters
    const chunk = puzzle.slice(i, i + TOTAL_CHARACTERS_PER_ROW);

    const row = document.createElement("div");

    // Create a span for each character in each row
    for (let j = 0; j < chunk.length; j++) {
      const span = document.createElement("span");

      span.innerHTML = chunk[j];

      row.appendChild(span);
    }

    fragment.appendChild(row);
  }

  terminalScreen.appendChild(fragment);
};

// Initialize the terminal on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const puzzle = generateHackablePuzzle();

  displayPuzzle(puzzle);
});
