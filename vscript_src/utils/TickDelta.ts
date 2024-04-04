export default class TickDelta {
	private lastTime: number;
	private delta: number;

	constructor() {
		this.lastTime = Time();
		this.delta = 0;
	}

	/**
	 * Calculates the delta.
	 * Should be the first thing called at the top of a tick/think function.
	 * Returns the delta.
	 */
	public tick(): number {
		const now = Time();
		this.delta = now - this.lastTime;
		this.lastTime = now;
		return this.delta;
	}

	/**
	 * Returns the current delta.
	 */
	public getDelta(): number {
		return this.delta;
	}
}
