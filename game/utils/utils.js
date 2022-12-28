export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export const randomInt = (min, max) => Math.floor(Math.random() * (max+1 - min) + min);

export function scalarToCoord(scalar, width, height) {
  return [scalar%width, Math.floor(scalar/width)];
}

export function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

export const binaryToHex = (number, expectedLength) => {
  const hex = parseInt(number, 2).toString(16).toUpperCase();
  return hex.padStart(expectedLength, '0');
}

export const hexToBinary = (hex, expectedLength) => {
  const b = parseInt(hex, 16).toString(2);
  return b.padStart(expectedLength, '0');
}

export const integerToHex = (number, expectedLength) => {
  const hex = parseInt(number).toString(16).toUpperCase();
  return hex.padStart(expectedLength, '0');
}

export const hexToInteger = (hex, expectedLength) => {
  const n = parseInt(hex, 16).toString();
  return n.padStart(expectedLength, '0');
}

export const getFirstNonZero = (str) => {
  for (let c of str) {
    if (c != '0')
      return c;
  }
  return '0';
}


