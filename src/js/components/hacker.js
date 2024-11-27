// VARS + IMPORTS

import {
  randomNumberGenerator,
  generateRandomHex,
  multipleRandomNumberGenerator,
  generateRandomWords,
  typer,
} from "./utils";

const terminal = document.getElementById("terminal");

// Add new container for the game
const game = document.createElement("div");

// Add a container for the puzzle
const cipher = document.createElement("div");

// Add a container for the guess output info
const guessOutput = document.createElement("div");

let attemptCount = 4;

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
      SPECIAL_CHARACTERS[
        randomNumberGenerator(0, SPECIAL_CHARACTERS.length - 1)
      ],
  );

  return garble;
};

const generateHackablePuzzle = () => {
  // Generate an array of length 384 filled wth special characters for the bulk/base of the puzzle output
  const output = generateGarble(TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW);

  // Generate an array of unqiue random index positions from 0 to 384 - password length (so no password gets cut off) for the positions of the passwords within the puzzle
  const passwordPositions = multipleRandomNumberGenerator(
    0,
    TOTAL_ROWS * TOTAL_CHARACTERS_PER_ROW - PASSWORD_LENGTH,
    PASSWORD_FREQUENCY,
    PASSWORD_LENGTH + 1,
  );

  // Generate 20 random 5 letters words to act as either the password or dud
  const passwords = generateRandomWords(PASSWORD_FREQUENCY, PASSWORD_LENGTH);

  const correctPassword =
    passwords[randomNumberGenerator(0, passwords.length - 1)];

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
  // Initial typing setup
  typer(terminal, {
    strings: [
      "Welcome to ROBCO Industries (TM) Termlink",
      "Password Required",
      "Attempts Remaining",
    ],
    speed: 30,
    waitUntilVisible: true,
    cursor: true,

    // Start second typing effect after first one completes
    afterComplete: (instance) => {
      instance.destroy();

      // Add the correct game elements to the terminal
      game.classList.add("flex", "gap-8");
      terminal.appendChild(game);

      cipher.classList.add("columns-2", "gap-x-[1ch]");
      game.appendChild(cipher);

      game.appendChild(guessOutput);

      // Get extra information from during the puzzle generation
      const { output, passwordPositions, passwords } = puzzle;

      const fragment = document.createDocumentFragment();

      let previousSeenPassword;

      for (let i = 0; i < output.length; i += TOTAL_CHARACTERS_PER_ROW) {
        // Extract a row of characters
        const chunk = output.slice(i, i + TOTAL_CHARACTERS_PER_ROW);

        const row = document.createElement("div");

        // Every row must start with a random hexadecimal number
        const randomHexadecimal = generateRandomHex(4);

        const hexadecimalPrefix = document.createElement("span");
        hexadecimalPrefix.innerHTML = `0x${randomHexadecimal}`;
        hexadecimalPrefix.classList.add("mr-[1ch]");

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

        // Create typing effect as the puzzle is generated
        typer(row, {
          strings: [],
          speed: randomNumberGenerator(30, 45),
          cursor: false,
        });
      }

      cipher.appendChild(fragment);
    },
  });
};

const checkWordLikeness = (guess, target) => {
  let likeness = 0;

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) likeness++;
  }

  return likeness;
};

const handleHover = (e, hovering) => {
  const target = e.target;

  if (target.nodeName !== "SPAN") return;

  const password = target.dataset.password;

  const relatedSpans = password
    ? Array.from(document.querySelectorAll(`[data-password=${password}]`))
    : [target];

  relatedSpans.forEach((span) =>
    hovering
      ? span.classList.add("bg-[#5bf870]", "text-[#05321e]")
      : span.classList.remove("bg-[#5bf870]", "text-[#05321e]"),
  );
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
    guessOutput.append(successMessage);

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
  guessOutput.appendChild(guess);
  guessOutput.appendChild(response);
  guessOutput.appendChild(likenessResponse);

  attemptCount -= 1;

  if (attemptCount === 0) handleTerminalLockout();
};

const handleTerminalLockout = () => {
  terminal.innerHTML = "";

  const lockOutMessage = document.createElement("p");
  lockOutMessage.innerHTML = "TERMINAL LOCKED";

  const secondaryLockoutMessage = document.createElement("p");
  secondaryLockoutMessage.innerHTML = "PLEASE CONTACT AN ADMINISTRATOR";

  terminal.appendChild(lockOutMessage);
  terminal.appendChild(secondaryLockoutMessage);

  terminal.classList.add(
    "flex",
    "flex-col",
    "gap-4",
    "justify-center",
    "items-center",
    "min-h-[calc(100vh-72px-72px)]",
  );
};

export const initializeHackerGame = () => {
  const puzzle = generateHackablePuzzle();

  // Display the puzzle after it has been generated
  displayPuzzle(puzzle);

  // Add appropriate event listeners

  cipher.addEventListener("mouseover", (e) => handleHover(e, true));

  cipher.addEventListener("mouseout", (e) => handleHover(e, false));

  cipher.addEventListener("click", (e) => handlePasswordGuess(e, puzzle));

  return puzzle;
};
