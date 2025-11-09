/**
 * Valid species types in the game
 */

export enum Species {

  TEST = "Test", // Left for testing purposes, not included in foodchain chart

  // Yellowstone Type Environment 

	// Producers
	GRASS = 'Grass',
	SUNFLOWER = 'Sunflower',
	BERRY_BUSH = 'BerryBush',
	MUSHROOM = 'Mushroom',

	// Primary Consumers
	ANT = 'Ant', // eats grass
	RABBIT = 'Rabbit',
	DEER = 'Deer',
	ELK = 'Elk',
	GRASSHOPPER = 'Grasshopper', // eats grass
	CATERPILLAR = 'Caterpillar', // eats grass
	SQUIRREL = 'Squirrel',
	MOUSE = 'Mouse',
	BISON = 'Bison',
	MOOSE = 'Moose',

	// Secondary Consumers
	ROBIN = 'Robin', // eats bugs, grass
	SPARROW = 'Sparrow', // eats bugs, grass
	SKUNK = 'Skunk', // eats rodents, grasshopper
	RACCOON = 'Raccoon', // eats rodents, insects, eaten by cougar, wolf, bear, eagle
	PORCUPINE = 'Porcupine', // eats grass, leaves, eaten by cougar, lynx,
	SNAKE = 'Snake', // eats rodents

	// Tertiary Consumers
	FOX = 'Fox', // eats snake, rabbits, squirrel,
	COYOTE = 'Coyote', // eats snakes, rabbits, rodents, eaten by cougar, bear
	LYNX = 'Lynx', // eats snake, rabbits, rodents

	// Apex Predators
	HAWK = 'Hawk', // eats coyote, all level 2
	WOLF = 'Wolf', // eats deer, moose, bison
	COUGAR = 'Cougar', // eats deer, moose, bison
	BEAR = 'Bear', // eats deer, moose, bison
}

const INSECTS = [Species.ANT, Species.CATERPILLAR, Species.GRASSHOPPER];
const RODENTS = [Species.MOUSE, Species.SQUIRREL];
const UNGULATES = [Species.BISON, Species.DEER, Species.ELK, Species.MOOSE];
const BIRDS = [Species.ROBIN, Species.SPARROW];

export const PRODUCERS = [Species.GRASS, Species.SUNFLOWER, Species.BERRY_BUSH, Species.MUSHROOM];

export const PRIMARY_CONSUMERS = [...INSECTS, ...UNGULATES, ...RODENTS];

export const SECONDARY_CONSUMERS = [
	...BIRDS,
	Species.SKUNK,
	Species.RACCOON,
	Species.PORCUPINE,
	Species.SNAKE,
];

export const TERTIARY_CONSUMERS = [Species.FOX, Species.COYOTE, Species.LYNX];

export const APEX_PREDATORS = [Species.HAWK, Species.WOLF, Species.COUGAR, Species.BEAR];

export const SpeciesRelations = new Map<Species, { prey: Species[]; predators: Species[] }>([
	// -------- Level 0 - Producers

	[Species.GRASS, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.SUNFLOWER, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.BERRY_BUSH, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.MUSHROOM, { prey: [], predators: PRIMARY_CONSUMERS }],

	// -------- Level 1 - Primary Consumers

	[Species.RABBIT, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	[Species.DEER, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	[Species.ELK, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	[Species.MOOSE, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	[Species.GRASSHOPPER, { prey: PRODUCERS, predators: [...BIRDS, ...RODENTS] }],
	[Species.MOUSE, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	[Species.ANT, { prey: PRODUCERS, predators: [...BIRDS, ...RODENTS] }],

	// -------- Level 2 - Secondary Consumers

	[Species.ROBIN, { prey: [...INSECTS, ...PRODUCERS], predators: SECONDARY_CONSUMERS }],
	[Species.SKUNK, { prey: [...INSECTS, ...RODENTS], predators: SECONDARY_CONSUMERS }],
	[Species.RACCOON, { prey: [...INSECTS, ...RODENTS], predators: SECONDARY_CONSUMERS }],
	[Species.PORCUPINE, { prey: [...INSECTS, ...RODENTS], predators: SECONDARY_CONSUMERS }],
	[Species.SNAKE, { prey: RODENTS, predators: SECONDARY_CONSUMERS }],

	// -------- Level 3 - Tertiary Consumers

	[Species.FOX, { prey: SECONDARY_CONSUMERS, predators: APEX_PREDATORS }],
	[Species.COYOTE, { prey: SECONDARY_CONSUMERS, predators: APEX_PREDATORS }],
	[Species.LYNX, { prey: SECONDARY_CONSUMERS, predators: APEX_PREDATORS }],

	// -------- Level 4 - Apex Predators

	[Species.HAWK, { prey: [...SECONDARY_CONSUMERS, ...TERTIARY_CONSUMERS], predators: [] }],
	[Species.WOLF, { prey: [...UNGULATES, ...TERTIARY_CONSUMERS], predators: [] }],
	[Species.COUGAR, { prey: [...UNGULATES, ...TERTIARY_CONSUMERS], predators: [] }],
	[Species.BEAR, { prey: [...UNGULATES, ...TERTIARY_CONSUMERS], predators: [] }],
]);

export const ALL_SPECIES = Object.values(Species);
