import {assert, hexToBinary, hexToInteger, getFirstNonZero} from '../utils/utils.js';

export const EXPECTED_DNA_LENGTH = 3+1+2*3+3;
export const DNA_PARTITION = {
	// "vision": {"loc":[0,6], "maxHex": 6, "maxRaw": 24},
	"maxEnergy": {"loc":[0,3], "maxHex": 3, "maxRaw": 4},
	"iSpeed": {"loc":[3,4], "maxHex": 1, "maxRaw": 1},
	"neurons": {"loc":[4,10], "maxHex": 3, "maxRaw": 4},
	"iLearningSpeed": {"loc":[10,13], "maxHex": 6, "maxRaw": 8}
}

export class DNA {

	constructor(dna_str) {
		assert(!dna_str || dna_str.length == EXPECTED_DNA_LENGTH, `bad dna length: 
			expect to be ${EXPECTED_DNA_LENGTH}, found ${dna_str ? dna_str.length : 0} instead`);

		this.dna = dna_str;

		if (!dna_str)
			return;

		this.setStats();

	}

	setStats() {
		// const hexVision = this.dna.slice(DNA_PARTITION["vision"]["loc"][0], DNA_PARTITION["vision"]["loc"][1]);
		// this.vision = hexToBinary(hexVision,DNA_PARTITION["vision"]["maxRaw"]).split("").map((x) => x=="1"? 1:0);
		const hexME = this.dna.slice(DNA_PARTITION["maxEnergy"]["loc"][0], DNA_PARTITION["maxEnergy"]["loc"][1]);
		this.maxEnergy = parseInt(hexToInteger(hexME, DNA_PARTITION["maxEnergy"]["maxRaw"]));

		const hexIS = this.dna.slice(DNA_PARTITION["iSpeed"]["loc"][0], DNA_PARTITION["iSpeed"]["loc"][1]);
		this.inverseSpeed = parseInt(hexToInteger(hexIS, DNA_PARTITION["iSpeed"]["maxRaw"]));

		const hexNeurons = this.dna.slice(DNA_PARTITION["neurons"]["loc"][0], DNA_PARTITION["neurons"]["loc"][1]);
		this.neurons = [hexNeurons.slice(0,3),hexNeurons.slice(3)].map((x) => parseInt(hexToInteger(x, DNA_PARTITION["neurons"]["maxRaw"]))).filter((x) => !isNaN(x) & x > 0);

		const hexLS = this.dna.slice(DNA_PARTITION["iLearningSpeed"]["loc"][0], DNA_PARTITION["iLearningSpeed"]["loc"][1]);
		this.learningSpeed = 1/parseInt(hexToInteger(hexLS, DNA_PARTITION["iLearningSpeed"]["maxRaw"]));

		this.color = `#F${getFirstNonZero(hexME)}${getFirstNonZero(hexIS)}`
						+`${getFirstNonZero(hexNeurons)}${getFirstNonZero(hexNeurons.slice(3))}${getFirstNonZero(hexLS)}`
	}
}