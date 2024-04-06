
export default interface Tool {
	/**
	 * Called before the tool activates to precache resources.
	 * Lua: Precache()
	 * @param context 
	 */
	precache(context: any): void;

	/**
	 * Called when the tool is activated/spawned.
	 * Lua: OnActivate()
	 */
	activate(): void;

	/**
	 * Called every update.
	 * Return next think time.
	 * Lua: SetThink(...)
	 */
	think(): number;
	
	/**
	 * Called when the tool is picked up.
	 * Return true if the tool should be picked up.
	 * Lua: SetEquipped()
	 * @param hand ref to hand
	 * @param handID hand ID
	 * @param handAttachment ref to hand attachment 
	 * @param player player
	 */
	equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean;

	/**
	 * Called when the tool is dropped.
	 * Return true if tool should be dropped.
	 * Lua: SetUnequipped()
	 */
	drop(): boolean;

	/**
	 * Called on controller input.
	 * Lua: OnHandleInput()
	 * Return original or modified input.
	 * @param input input data
	 */
	handleInput(input: CHandInputData): CHandInputData
}
