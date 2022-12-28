import {DNA, EXPECTED_DNA_LENGTH} from '../game/agent/dna.js';
import { equal, expect } from "assert";

describe('constructor', () => {
	it('it accepts empty dna string', () => {
	 	const s = new DNA();
		equal(s.dna, undefined);
	});

	// it('it parses vision', () => {
	//  	const s = new DNA("039DC00645010000064");
	//  	const target = [0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,1,1,1,0,0,0,0,0,0];

	//  	s.vision.forEach((v,i) => {equal(v, target[i])});

	// });

	it('it parses maxEnergy', () => {
	 	const s = new DNA("0645010000064");
	 	equal(s.maxEnergy, 100);

	});

	it('it parses inverseSpeed', () => {
	 	const s = new DNA("0645010000064");
	 	equal(s.inverseSpeed, 5);

	});

	it('it parses NN', () => {
	 	const s = new DNA("064500F000064");
	 	equal(s.neurons[0], 15);

	});

	it('it parses learningSpeed', () => {
	 	const s = new DNA("0645010000064");
	 	equal(s.learningSpeed, 0.01);

	});

	it('it gets a color', () => {
	 	const s = new DNA("064500F000064");
	 	equal(s.color, '#F65F06');

	});
});