import Tool from "../Tool";
import TickDelta from "../../utils/TickDelta";
import {VTunnel, VTunnelMessage, VTunnelSerializable} from "../../vconsole_tunnel/VTunnel";
import {LineTrace} from "../../utils/Trace";

const gadgetActivatedMessage = new VTunnelMessage(VTunnelMessage.NO_ID, "gadget_activated");
const gadgetDeactivatedMessage = new VTunnelMessage(VTunnelMessage.NO_ID, "gadget_deactivated");

/**
 * This tool captures detailed controller input for VTunnel extraction.
 */
export default class VTunnelGadget extends Tool {
    private isEquipped: boolean = false;
    private hand: CPropVRHand | null = null;
    private handID: number = -1;
    private handAttachment: CBaseEntity | null = null;
    private player: CBasePlayer | null = null;

    private trace: LineTrace;
    private gadgetColor: Vector;

    constructor(entity: CDestinationsPropTool) {
        super(entity);
        this.trace = new LineTrace(Vector(), Vector());
        this.gadgetColor = Vector(0, 0, 0);

        VTunnel.onMessage('vtunnel_connected',(msg: VTunnelMessage) => {
            if (this.isEquipped) {
                VTunnel.send(gadgetActivatedMessage);
            } else {
                VTunnel.send(gadgetDeactivatedMessage);
            }
        });

        VTunnel.onMessage('gadget_state',(msg: VTunnelMessage) => {
            // const state = msg.indexPartDataAsInt(0);
            this.gadgetColor = msg.indexPartDataAsVector(1);
        });
    }

    public equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean {
        this.isEquipped = true;
        this.hand = hand;
        this.handID = handID;
        this.handAttachment = handAttachment;
        this.player = player;

        this.player.SetContentBrowserAllowed(false);
        VTunnel.send(gadgetActivatedMessage);
        EmitSoundOn('skyhook_equip', this.entity);

        return true;
    }

    public drop(): boolean {
        this.player!.SetContentBrowserAllowed(true);

        this.isEquipped = false;
        this.hand = null;
        this.handID = -1;
        this.handAttachment = null;
        this.player = null;

        VTunnel.send(gadgetDeactivatedMessage);

        return true;
    }

    public handleInput(input: CHandInputData): CHandInputData {
        const rotatedOffset = RotatePosition(Vector(0, 0, 0), this.entity.GetAngles(), Vector(0, 0, 3));
        const toolPos = addVector(this.entity.GetAbsOrigin(), rotatedOffset);
        const toolForward = -(this.entity.GetRightVector()) as Vector;
        this.trace.setStartPosition(toolPos);
        this.trace.setEndPosition(addVector(toolPos, mulVector(toolForward, 3000 as Vector)));
        this.trace.setIgnoreEntity(this.player!);
        const traceResult = this.trace.run();

        if (traceResult.hasHit()) {
            DebugDrawLine(toolPos, traceResult.getHitPosition(), this.gadgetColor.x, this.gadgetColor.y, this.gadgetColor.z, false, 0);
        }

        const vmsg = new VTunnelMessage(VTunnelMessage.NO_ID, "player_input");
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

        const IN_TRIGGER = this.handID === 0 ? IN_USE_HAND0 : IN_USE_HAND1;
        const IN_GRIP = this.handID === 0 ? IN_GRIP_HAND0 : IN_GRIP_HAND1;
        if (input.buttonsReleased.IsBitSet(IN_TRIGGER)) {
            // Prevent trigger release from dropping the tool
            input.buttonsReleased.ClearBit(IN_TRIGGER);
        }

        if (input.buttonsReleased.IsBitSet(IN_GRIP)) {
            input.buttonsReleased.ClearBit(IN_GRIP);

            this.getEntity().ForceDropTool();  // This seems like it's not needed, it drops either way.
        }

        return input;
    }
}
