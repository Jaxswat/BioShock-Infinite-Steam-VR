import Tool from "../Tool";
import TickDelta from "../../utils/TickDelta";
import {VTunnel, VTunnelMessage, VTunnelSerializable} from "../../vconsole_tunnel/VTunnel";
import {LineTrace} from "../../utils/Trace";

/**
 * This tool captures detailed controller input for VTunnel extraction.
 */
export default class VTunnelGadget extends Tool {
    private hand: CPropVRHand | null = null;
    private handID: number = -1;
    private handAttachment: CBaseEntity | null = null;
    private player: CBasePlayer | null = null;

    private trace: LineTrace;

    constructor(entity: CDestinationsPropTool) {
        super(entity);
        this.trace = new LineTrace(Vector(), Vector());
    }

    public equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean {
        this.hand = hand;
        this.handID = handID;
        this.handAttachment = handAttachment;
        this.player = player;

        return true;
    }

    public drop(): boolean {
        this.hand = null;
        this.handID = -1;
        this.handAttachment = null;
        this.player = null;

        return true;
    }

    public handleInput(input: CHandInputData): CHandInputData {
        const IN_TRIGGER = this.handID === 0 ? IN_USE_HAND0 : IN_USE_HAND1;
        const IN_GRIP = this.handID === 0 ? IN_GRIP_HAND0 : IN_GRIP_HAND1;

        if (input.buttonsReleased.IsBitSet(IN_TRIGGER)) {
            // Prevent trigger release from dropping the tool
            input.buttonsReleased.ClearBit(IN_TRIGGER);
        }

        if (input.buttonsReleased.IsBitSet(IN_GRIP)) {
            input.buttonsReleased.ClearBit(IN_GRIP);

            // Drop the tool when grip is pressed
            this.getEntity().ForceDropTool();
        }

        const rotatedOffset = RotatePosition(Vector(0, 0, 0), this.entity.GetAngles(), Vector(0, 0, 3));
        const toolPos = addVector(this.entity.GetAbsOrigin(), rotatedOffset);
        const toolForward = -(this.entity.GetRightVector()) as Vector;
        this.trace.setStartPosition(toolPos);
        this.trace.setEndPosition(addVector(toolPos, mulVector(toolForward, 3000 as Vector)));
        this.trace.setIgnoreEntity(this.player!);
        const traceResult = this.trace.run();

        if (traceResult.hasHit()) {
            DebugDrawLine(toolPos, traceResult.getHitPosition(), 255, 255, 255, false, 0);
        }

        const vmsg = new VTunnelMessage("player_input");
        vmsg.writeInt(this.player!.GetUserID());
        vmsg.writeInt(this.handID);
        vmsg.writeVector(this.hand!.GetAbsOrigin());
        vmsg.writeVector(this.hand!.GetAnglesAsVector());
        vmsg.writeBoolean(traceResult.hasHit());
        vmsg.writeFloat(traceResult.getFraction());
        vmsg.writeVector(traceResult.getHitNormal());
        vmsg.writeVector(traceResult.getHitPosition());
        vmsg.writeUInt64(input.buttonsDown);
        vmsg.writeUInt64(input.buttonsPressed);
        vmsg.writeUInt64(input.buttonsReleased);
        vmsg.writeFloat(input.joystickX);
        vmsg.writeFloat(input.joystickY);
        vmsg.writeFloat(input.trackpadX);
        vmsg.writeFloat(input.trackpadY);
        vmsg.writeFloat(input.triggerValue);

        VTunnel.send(vmsg);

        return input;
    }
}
