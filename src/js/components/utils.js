import { generate } from "random-words";

import TypeIt from "typeit";

/**
 * Generates a random number from min (inclusive) to max (inclusive)
 *
 * @param {number} max - The maximum number to generate
 * @param {number} min - The minimum number to generate
 * @returns {number} A random number from 0 to max
 * @throws {Error} If the max is not a positive numerical value.
 */
export const randomNumberGenerator = (min, max) => {
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
 * @param {number} min - The minimum number to generate
 * @param {number} max - The maximum number to generate
 * @param {number} length - The maximum numbers to generate
 * @param {number} [minDifference = 0] - The minimum difference between each number.
 * @returns {number[]} A random array of numbers matching length
 */
export const multipleRandomNumberGenerator = (
  min,
  max,
  length,
  minDifference = 0,
) => {
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
    const randomValue = randomNumberGenerator(min, max);

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
export const generateRandomWords = (max, length) =>
  // FIXME: known bug - this generation of random words does NOT prevent duplicate words, which can cause problems
  generate({ exactly: max, minLength: length, maxLength: length });

/**
 * Generates a random hexadecimal number of a given size
 *
 * @param {number} size - The length of the hexadecimal value to generate
 * @returns {string} A random hexadecimal value
 */
export const generateRandomHex = (size) =>
  Array.from({ length: size }, () =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase(),
  ).join("");

export const typer = (container, options) => {
  const instance = new TypeIt(container, options);

  instance.go();

  return instance;
};

/**
 * Creates a promise that resolves after a specified delay.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
