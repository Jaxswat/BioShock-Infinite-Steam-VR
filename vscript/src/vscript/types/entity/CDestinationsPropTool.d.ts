/**
 * Entity class for prop_destinations_tool.
 * A generic tool prop that can be picked up by the player.
 * The tool functionality is implemented using scripts.
 * When picked up by the player, attaches to the vr_controller_root attachment of the model.
 */
declare abstract class CDestinationsPropTool extends CBaseAnimating {
    /**
     * Drops the tool from the player's hand.
     */
    ForceDropTool(): void;
}
