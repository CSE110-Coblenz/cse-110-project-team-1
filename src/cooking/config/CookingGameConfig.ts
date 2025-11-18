export const CookingGameConfig = {
	NUM_CUSTOMERS: 5,
	MAX_ACTIVE_CUSTOMERS: 3,
	INITIAL_PATIENCE: 100,
	PATIENCE_DECREASE_RATE: 5 / 1000, // patience points per millisecond
	FRAME_TIME: 1000 / 60, // 60 FPS, in milliseconds
} as const;
