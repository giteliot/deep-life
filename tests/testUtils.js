import {scalarToCoord, binaryToHex, hexToBinary, integerToHex, hexToInteger, randomInt} from '../game/utils/utils.js';
import { equal } from "assert";

describe('scalarToCoord', () => {
	it('5, in [6, N] is (0, 5)', () => {
	 	const s = scalarToCoord(5, 6, 10);
		equal(s[0], 5);
		equal(s[1], 0);
	});

	it('6, in [6, N] is (1, 0)', () => {
	 	const s = scalarToCoord(6, 6, 10);
	 	console.log(s)
		equal(s[0], 0);
		equal(s[1], 1);
	});
});


describe('binaryToHex', () => {
	it('1111 to F', () => {
		equal(binaryToHex(1111, 6), '00000F');
	});
	it('010011111110 to 4FE', () => {
		equal(binaryToHex(10011111110, 6), '0004FE');
	});
});


describe('hexToBinary', () => {
	it('F to 1111', () => {
		equal(hexToBinary('F', 24), '000000000000000000001111');
	});
});


describe('integerToHex', () => {
	it('122 to 7A', () => {
		equal(integerToHex(122, 3), '07A');
	});
});


describe('hexToInteger', () => {
	it('07A to 122', () => {
		equal(hexToInteger('07A', 4), '0122');
	});
});

describe('random', () => {
	it('r', () => {
		const o = [];
		for (let k = 0; k < 100; k++) {
			o.push(randomInt(0, 5))
		}
		console.log(o);
	});
});


