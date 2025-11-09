export const CookingGameConfig = {
	NUM_CUSTOMERS: 5,
	MAX_ACTIVE_CUSTOMERS: 3,
	INITIAL_PATIENCE: 100,
	PATIENCE_DECREASE_RATE: 10, // patience points per second
} as const;
