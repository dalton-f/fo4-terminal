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

import { initializeHackerGame } from "./components/hacker";

document.addEventListener("DOMContentLoaded", () => {
  initializeHackerGame();
});
