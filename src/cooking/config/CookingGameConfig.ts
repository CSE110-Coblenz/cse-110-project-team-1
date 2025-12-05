export const CookingGameConfig = {
	NUM_CUSTOMERS: 5,
	MAX_ACTIVE_CUSTOMERS: 3,
	INITIAL_PATIENCE: 100,
	PATIENCE_DECREASE_RATE: 5, // patience points per second
	FRAME_TIME: 1000 / 60, // 60 FPS, in milliseconds
	POINTS_PER_CORRECT: 10, // points awarded for each correct assignment
	MAX_SPEED_BOOST_PER_ROUND: 20, // maximum speed boost when achieving perfect score per round
} as const;
