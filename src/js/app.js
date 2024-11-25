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

// TODO:
// - typing animation
// - updated visuals?
// - login terminal
// - better success screen

// VARS + GLOBALS + IMPORTS

import confetti from "canvas-confetti";
import { generate } from "random-words";

const terminalScreen = document.getElementById("terminal-screen");
const terminalOutput = document.getElementById("terminal-output");
const attemptsCounter = document.getElementById("attempts");

const difficultySelector = document.getElementById("difficultySelector");

let attemptCount = 4;

let hoverListener, outListener, clickListener;

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

let passwordLength = 5;
let passwordFrequency = 20;

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
  // FIXME: known bug - this generation of random words does NOT prevent duplicate words, which can cause problems
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

/**
 * Generates a random hexadecimal number of a given size
 *
 * @param {number} size - The length of the hexadecimal value to generate
 * @returns {string} A random hexadecimal value
 */
const getRandomHexadecimal = (size) =>
  Array.from({ length: size }, () =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase(),
  ).join("");

// MAIN FUNCTIONS

const generateHackablePuzzle = () => {
  // Generate an array of length 384 filled wth special characters for the bulk/base of the puzzle output
  const output = generateGarble(TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW);

  // Generate an array of unqiue random index positions from 0 to 384 - password length (so no password gets cut off) for the positions of the passwords within the puzzle
  const passwordPositions = multipleRandomNumberGenerator(
    TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW - passwordLength,
    passwordFrequency,
    passwordLength + 1,
  );

  // Generate 20 random 5 letters words to act as either the password or dud
  const passwords = generateRandomWords(passwordFrequency, passwordLength);

  const correctPassword =
    passwords[randomNumberGenerator(passwords.length - 1)];

  // Use the passwords and their randomly generated positions to add them into the output
  for (let i = 0; i < passwordPositions.length; i++) {
    const targetIndex = passwordPositions[i];
    const targetPassword = passwords[i];

    // Add each individual letter of the password to the array by splitting it up and deleting one character from the array to maintain the 384 length
    for (let j = 0; j < targetPassword.length; j++) {
      output.splice(targetIndex + j, 1, targetPassword[j]);
    }
  }

  return { output, passwordPositions, passwords, correctPassword };
};

const displayPuzzle = (puzzle) => {
  // Get extra information from during the puzzle generation
  const { output, passwordPositions, passwords } = puzzle;

  const fragment = document.createDocumentFragment();

  let previousSeenPassword;

  for (let i = 0; i < output.length; i += TOTAL_CHARACTERS_PER_ROW) {
    // Extract a row of characters
    const chunk = output.slice(i, i + TOTAL_CHARACTERS_PER_ROW);

    const row = document.createElement("div");

    // Every row must start with a random hexadecimal number
    const randomHexadecimal = getRandomHexadecimal(4);

    const hexadecimalPrefix = document.createElement("span");
    hexadecimalPrefix.innerHTML = `0x${randomHexadecimal} `;

    row.appendChild(hexadecimalPrefix);

    // Create a span for each character in each row
    for (let j = 0; j < chunk.length; j++) {
      const span = document.createElement("span");

      span.innerHTML = chunk[j];

      // If the current character isn't a special character, that means it is part of a word
      if (!SPECIAL_CHARACTERS.includes(chunk[j])) {
        // Password will only return the correct password for the first character/index of that word, so we store it for the rest of a wodr until password is redefined
        const password = passwords[passwordPositions.indexOf(i + j)];

        if (password) previousSeenPassword = password;

        // Set attribute for grouping and event listeners
        span.dataset.password = password || previousSeenPassword;

        span.classList.add(
          "cursor-pointer",
          "transition",
          "duration-150",
          "ease-linear",
          "uppercase",
        );
      }

      row.appendChild(span);
    }

    fragment.appendChild(row);
  }

  terminalScreen.appendChild(fragment);
};

const checkWordLikeness = (guess, target) => {
  let likeness = 0;

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) likeness++;
  }

  return likeness;
};

const handlePasswordHover = (e, hovering) => {
  const target = e.target;

  if (!target.hasAttribute("data-password")) return;

  // If hovering over a password
  const password = target.dataset.password;

  // Get all the character spans
  const relatedSpans = Array.from(
    document.querySelectorAll(`[data-password=${password}]`),
  );

  // Add or remove hovering classes
  if (hovering) {
    relatedSpans.forEach((span) =>
      span.classList.add("bg-[#5bf870]", "text-[#05321e]"),
    );
  } else {
    relatedSpans.forEach((span) =>
      span.classList.remove("bg-[#5bf870]", "text-[#05321e]"),
    );
  }
};

const handlePasswordGuess = (e, puzzle) => {
  const target = e.target;

  // If the user clicked on a password
  if (!target.hasAttribute("data-password")) return;

  // And has attempts left
  if (attemptCount === 0) return;

  const { correctPassword } = puzzle;

  const selectedPassword = target.dataset.password;

  // Add success message if they guessed correctly
  if (selectedPassword === correctPassword) {
    const successMessage = document.createElement("div");
    successMessage.innerHTML = "Terminal unlocked";
    terminalOutput.append(successMessage);

    const restartButton = document.createElement("button");
    restartButton.innerHTML = "Click to restart";
    restartButton.id = "restartButton";

    terminalOutput.append(restartButton);

    confetti({
      angle: randomNumberGenerator(125, 55),
      spread: randomNumberGenerator(70, 50),
      particleCount: randomNumberGenerator(100, 50),
      origin: { y: 0.6 },
    });

    return;
  }

  // Get likeness
  const likeness = checkWordLikeness(selectedPassword, correctPassword);

  const guess = document.createElement("div");
  const response = document.createElement("div");
  const likenessResponse = document.createElement("div");

  // Generate the three responses
  guess.innerHTML = `>${selectedPassword}`;
  response.innerHTML = ">Entry denied";
  likenessResponse.innerHTML = `>Likeness=${likeness}`;

  guess.classList.add("uppercase");

  // Append them
  terminalOutput.appendChild(guess);
  terminalOutput.appendChild(response);
  terminalOutput.appendChild(likenessResponse);

  attemptCount -= 1;

  // Delete the last child of the attempt squares
  attemptsCounter.removeChild(attemptsCounter.lastElementChild);

  if (attemptCount === 0) {
    const lockout = document.createElement("div");

    lockout.innerHTML = "Terminal locked";

    terminalOutput.appendChild(lockout);

    const restartButton = document.createElement("button");
    restartButton.innerHTML = "Click to restart";
    restartButton.id = "restartButton";

    terminalOutput.append(restartButton);
  }
};

const resetGame = () => {
  resetEventListeners();

  terminalScreen.innerHTML = "";
  terminalOutput.innerHTML = "";
  // Manually reset counter
  attemptsCounter.innerHTML = `
  <div class="size-4 bg-[#5bf870]"></div>
  <div class="size-4 bg-[#5bf870]"></div>
  <div class="size-4 bg-[#5bf870]"></div>
  <div class="size-4 bg-[#5bf870]"></div>`;

  attemptCount = 4;

  initializeGame();
};

const initializeGame = () => {
  const puzzle = generateHackablePuzzle();

  // Display the puzzle after it has been generated
  displayPuzzle(puzzle);

  // Add appropriate event listeners
  initEventListeners(puzzle);

  return puzzle;
};

// Remove any event listeners
const resetEventListeners = () => {
  terminalScreen.removeEventListener("mouseover", hoverListener);
  terminalScreen.removeEventListener("mouseout", outListener);
  terminalScreen.removeEventListener("click", clickListener);
};

// Add all event listeners needed for the game
const initEventListeners = (puzzle) => {
  hoverListener = (e) => handlePasswordHover(e, true);
  outListener = (e) => handlePasswordHover(e, false);
  clickListener = (e) => handlePasswordGuess(e, puzzle);

  terminalScreen.addEventListener("mouseover", hoverListener);
  terminalScreen.addEventListener("mouseout", outListener);
  terminalScreen.addEventListener("click", clickListener);
};

// Handle game resets
document.addEventListener("click", (e) => {
  if (e.target.id === "restartButton") resetGame();
});

// Reset game if difficulty changes
difficultySelector.addEventListener("change", () => {
  const selectedDifficulty = difficultySelector.value;

  switch (selectedDifficulty) {
    case "easy":
      passwordLength = 4;
      passwordFrequency = 10;
      break;
    case "normal":
      passwordLength = 5;
      passwordFrequency = 20;
      break;
    case "hard":
      passwordLength = 7;
      passwordFrequency = 15;
      break;
    case "extrahard":
      passwordLength = 10;
      passwordFrequency = 10;
      break;
  }

  resetGame();
});
