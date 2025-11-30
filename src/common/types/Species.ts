/**
 * Valid species types in the game
 */

export enum Species {
	// Yellowstone Type Environment

	// Producers
	GRASS = 'Grass',
	SUNFLOWER = 'Sunflower',
	BERRY_BUSH = 'BerryBush',
	WILLOW = 'Willow',

	// Primary Consumers
	ANT = 'Ant', // eats grass
	RABBIT = 'Rabbit',
	DEER = 'Deer',
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
	WEASEL = 'Weasel', // eats grass, leaves, eaten by cougar, lynx,
	GARTER_SNAKE = 'GarterSnake', // eats rodents

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
const UNGULATES = [Species.BISON, Species.DEER, Species.MOOSE];
const BIRDS = [Species.ROBIN, Species.SPARROW];

export interface SpeciesAttributes {
	damage: number;
	speed: number;
	health: number;
	color: string;
}

export const PRODUCERS = [Species.GRASS, Species.SUNFLOWER, Species.BERRY_BUSH, Species.WILLOW];

export const PRIMARY_CONSUMERS = [...INSECTS, ...UNGULATES, ...RODENTS, Species.RABBIT];

const SECONDARY_CONSUMER_NON_BIRDS = [
	Species.SKUNK,
	Species.RACCOON,
	Species.WEASEL,
	Species.GARTER_SNAKE,
];

export const SECONDARY_CONSUMERS = [...BIRDS, ...SECONDARY_CONSUMER_NON_BIRDS];

export const TERTIARY_CONSUMERS = [Species.FOX, Species.COYOTE, Species.LYNX];

export const APEX_PREDATORS = [Species.HAWK, Species.WOLF, Species.COUGAR, Species.BEAR];

export const SpeciesRelations = new Map<Species, { prey: Species[]; predators: Species[] }>([
	// -------- Level 0 - Producers

	[Species.GRASS, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.SUNFLOWER, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.BERRY_BUSH, { prey: [], predators: PRIMARY_CONSUMERS }],
	[Species.WILLOW, { prey: [], predators: PRIMARY_CONSUMERS }],

	// -------- Level 1 - Primary Consumers

	[Species.RABBIT, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	// Ungulates
	[Species.DEER, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	[Species.MOOSE, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	[Species.BISON, { prey: PRODUCERS, predators: APEX_PREDATORS }],
	// Insects
	[Species.CATERPILLAR, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	[Species.GRASSHOPPER, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	[Species.ANT, { prey: PRODUCERS, predators: SECONDARY_CONSUMERS }],
	// Rodents
	[
		Species.MOUSE,
		{ prey: PRODUCERS, predators: [...SECONDARY_CONSUMER_NON_BIRDS, ...TERTIARY_CONSUMERS] },
	],
	[
		Species.SQUIRREL,
		{ prey: PRODUCERS, predators: [...SECONDARY_CONSUMER_NON_BIRDS, ...TERTIARY_CONSUMERS] },
	],

	// -------- Level 2 - Secondary Consumers

	[
		Species.SKUNK,
		{ prey: [...INSECTS, ...RODENTS], predators: [...TERTIARY_CONSUMERS, ...APEX_PREDATORS] },
	],
	[
		Species.RACCOON,
		{ prey: [...INSECTS, ...RODENTS], predators: [...TERTIARY_CONSUMERS, ...APEX_PREDATORS] },
	],
	[
		Species.WEASEL,
		{ prey: [...INSECTS, ...RODENTS], predators: [...TERTIARY_CONSUMERS, ...APEX_PREDATORS] },
	],
	[Species.GARTER_SNAKE, { prey: RODENTS, predators: TERTIARY_CONSUMERS }],
	// birds
	[Species.ROBIN, { prey: [...INSECTS, ...PRODUCERS], predators: TERTIARY_CONSUMERS }],
	[Species.SPARROW, { prey: [...INSECTS, ...PRODUCERS], predators: TERTIARY_CONSUMERS }],

	// -------- Level 3 - Tertiary Consumers

	[
		Species.FOX,
		{ prey: [...RODENTS, ...SECONDARY_CONSUMERS, Species.RABBIT], predators: APEX_PREDATORS },
	],
	[
		Species.COYOTE,
		{ prey: [...RODENTS, ...SECONDARY_CONSUMERS, Species.RABBIT], predators: APEX_PREDATORS },
	],
	[
		Species.LYNX,
		{ prey: [...RODENTS, ...SECONDARY_CONSUMERS, Species.RABBIT], predators: APEX_PREDATORS },
	],

	// -------- Level 4 - Apex Predators

	[
		Species.HAWK,
		{
			prey: [...RODENTS, ...SECONDARY_CONSUMERS, ...TERTIARY_CONSUMERS, Species.RABBIT],
			predators: [],
		},
	],
	[Species.WOLF, { prey: [...UNGULATES, ...TERTIARY_CONSUMERS], predators: [] }],
	[
		Species.COUGAR,
		{ prey: [...UNGULATES, ...TERTIARY_CONSUMERS, ...SECONDARY_CONSUMERS], predators: [] },
	],
	[Species.BEAR, { prey: [...UNGULATES, ...TERTIARY_CONSUMERS], predators: [] }],
]);

export interface SpeciesAttributes {
	damage: number;
	speed: number;
	health: number;
	color: string;
}

function makeAttributesForGroup(
	speciesList: Species[],
	attrs: SpeciesAttributes,
): [Species, SpeciesAttributes][] {
	return speciesList.map((s) => [s, attrs]);
}

const PRODUCER_GREEN: string = '#33cc33';
const PRIMARY_CONSUMER_YELLOW: string = '#ffcc00';
const SECONDARY_CONSUMER_ORANGE: string = '#ff9933';
const TERTIARY_CONSUMER_RED: string = '#ff3333';
const APEX_PREDATOR_PURPLE: string = '#9933ff';

export const SpeciesAttributesMap = new Map<Species, SpeciesAttributes>([
	// Producers
	...makeAttributesForGroup(PRODUCERS, {
		damage: 0,
		speed: 0,
		health: 50,
		color: PRODUCER_GREEN,
	}),
	// Primary Consumers
	...makeAttributesForGroup(PRIMARY_CONSUMERS, {
		damage: 15, // Set high to see gameaply effect, these all must be tuned eventually
		speed: 60,
		health: 50,
		color: PRIMARY_CONSUMER_YELLOW,
	}),
	// Secondary Consumers
	...makeAttributesForGroup(SECONDARY_CONSUMERS, {
		damage: 20,
		speed: 45,
		health: 80,
		color: SECONDARY_CONSUMER_ORANGE,
	}),
	// Tertiary Consumers
	...makeAttributesForGroup(TERTIARY_CONSUMERS, {
		damage: 30,
		speed: 45,
		health: 80,
		color: TERTIARY_CONSUMER_RED,
	}),
	// Apex Predators
	...makeAttributesForGroup(APEX_PREDATORS, {
		damage: 30,
		speed: 45,
		health: 80,
		color: APEX_PREDATOR_PURPLE,
	}),
]);

export const ALL_SPECIES = Object.values(Species);

/**
 * Pick a random species appropriate for the given level number.
 * Levels: 1 -> primary, 2 -> secondary, 3 -> tertiary, 4 -> apex
 */
export function pickSpeciesForLevel(level: number): Species {
	switch (level) {
		case 1:
			return PRIMARY_CONSUMERS[Math.floor(Math.random() * PRIMARY_CONSUMERS.length)];
		case 2:
			return SECONDARY_CONSUMERS[Math.floor(Math.random() * SECONDARY_CONSUMERS.length)];
		case 3:
			return TERTIARY_CONSUMERS[Math.floor(Math.random() * TERTIARY_CONSUMERS.length)];
		case 4:
		default:
			return APEX_PREDATORS[Math.floor(Math.random() * APEX_PREDATORS.length)];
	}
}
