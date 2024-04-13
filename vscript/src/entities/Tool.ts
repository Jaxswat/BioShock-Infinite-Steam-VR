import BioshockEntity from "./BioshockEntity";

export default abstract class Tool extends BioshockEntity {
	protected constructor(entity: CDestinationsPropTool) {
		super(entity);
	}

	public getEntity(): CDestinationsPropTool {
		return this.entity as CDestinationsPropTool;
	}

	/**
	 * Called before the tool activates to precache resources.
	 * Lua: Precache()
	 * @param context 
	 */
	public precache(context: any): void {

	}

	/**
	 * Called when the tool is activated/spawned.
	 * Lua: OnActivate()
	 */
	public activate(): void {

	}

	/**
	 * Called every update.
	 * Return next think time.
	 * Lua: SetThink(...)
	 */
	public update(delta: number): void {
	}
	
	/**
	 * Called when the tool is picked up.
	 * Return true if the tool should be picked up.
	 * Lua: SetEquipped()
	 * @param hand ref to hand
	 * @param handID hand ID
	 * @param handAttachment ref to hand attachment 
	 * @param player player
	 */
	public equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean {
		return true;
	}

	/**
	 * Called when the tool is dropped.
	 * Return true if tool should be dropped.
	 * Lua: SetUnequipped()
	 */
	public drop(): boolean {
		return true;
	}

	/**
	 * Called on controller input.
	 * Lua: OnHandleInput()
	 * Return original or modified input.
	 * @param input input data
	 */
	public handleInput(input: CHandInputData): CHandInputData {
		return input;
	}
}
