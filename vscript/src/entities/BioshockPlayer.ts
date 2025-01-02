import {PlayerConnectEvent} from "../utils/DefaultEvents";
import Timer from "../utils/Timer";
import {LizEvent, LizEventManager} from "./elizabeth/lizEvents";
import BioshockEntity from "./BioshockEntity";
import {VTunnel, VTunnelMessage, VTunnelSerializable} from "../vconsole_tunnel/VTunnel";

export default class BioshockPlayer extends BioshockEntity implements VTunnelSerializable {
    private connectEvent: PlayerConnectEvent;
    private steamID: number;
    private name: string;
    private userID: number;

    private weaponCheckTimer: Timer;
    private lizReadyTimer: Timer;
    private lizReadyClicks: number;

    public constructor(connectEvent: PlayerConnectEvent) {
        super(null as any as CBasePlayer);

        this.connectEvent = connectEvent;
        this.steamID = this.connectEvent.xuid;
        this.name = this.connectEvent.name;
        this.userID = this.connectEvent.userid

        this.weaponCheckTimer = new Timer(0.2);
        this.lizReadyTimer = new Timer(0.75);
        this.lizReadyClicks = 0;
    }

    public getConnectEvent(): PlayerConnectEvent {
        return this.connectEvent;
    }

    public getSteamID(): number {
        return this.steamID;
    }

    public getName(): string {
        return this.name;
    }

    public getUserID(): number {
        return this.userID;
    }

    public getEntity(): CBasePlayer {
        return this.entity as CBasePlayer;
    }

    public setEntity(entity: CBasePlayer) {
        this.entity = entity;
    }

    /**
     * Returns true if onConnect has been called and a matching
     * player entity has been found.
     */
    public hasConnected(): boolean {
        return this.entity !== null;
    }

    /**
     * Called when the player is added to the map and ready to use
     */
    public onConnect() {
        print("Bioshock player connected", this.name, this.steamID, this.userID);
    }

    /**
     * Called when the player is removed from the map
     */
    public onDisconnect() {
        print("Bioshock player disconnected", this.name, this.steamID, this.userID);
    }

    private lastPress = false;

    /**
     * Called every update. Entity will always be set before this is called.
     */
    public update(delta: number): void {
        const entity = this.getEntity();
        const currentPress = entity.IsVRControllerButtonPressed(IN_USE_HAND0) || entity.IsVRControllerButtonPressed(IN_USE_HAND1);
        if (currentPress !== this.lastPress && currentPress) {
            this.lizReadyClicks++;
            if (this.lizReadyClicks == 2) {
                LizEventManager.emit(LizEvent.PlayerReady, { userID: this.getUserID() });
                this.lizReadyTimer.reset();
                this.lizReadyClicks = 0;
            }
        }
        this.lastPress = currentPress;

        this.lizReadyTimer.tick(delta);
        if (this.lizReadyTimer.isDone()) {
            this.lizReadyTimer.reset();
            this.lizReadyClicks = 0;
        }

        this.weaponCheckTimer.tick(delta);
        if (this.weaponCheckTimer.isDone()) {
            this.weaponCheckTimer.reset();

            // const leftTool = this.getToolInHand(0);
            const tool = this.getToolInHand(1);
            if (tool !== null) {
                // const hand = this.entity!.GetHMDAvatar()!.GetVRHand(1)?.GetHandAttachment();
                const target: CBaseEntity = tool;
                const origin = target.GetAbsOrigin();
                const forwardVector = target.GetForwardVector();
                const upVector = target.GetUpVector();
                const rightVector = target.GetRightVector();
                const forwardEndPoint = addVector(origin, mulVector(forwardVector, 5 as Vector));
                const upEndPoint = addVector(origin, mulVector(upVector, 5 as Vector));
                const rightEndPoint = addVector(origin, mulVector(rightVector, 5 as Vector));
                DebugDrawLine(origin, forwardEndPoint, 255, 0, 0, false, 0.2);
                DebugDrawLine(origin, upEndPoint, 0, 0, 255, false, 0.2);
                DebugDrawLine(origin, rightEndPoint, 0, 255, 0, false, 0.2);
            }
        }

        // VTunnel.send(this.serialize());
    }

    private getToolInHand(handID: number): CDestinationsPropTool | null {
        const hand = this.getEntity().GetHMDAvatar()!.GetVRHand(handID);
        if (hand === null) {
            return null;
        }

        return hand.GetChildren()?.find(e => e.GetClassname() === "steamTours_item_tool") as CDestinationsPropTool || null;
    }

    public serialize(): VTunnelMessage {
        const msg = new VTunnelMessage(VTunnelMessage.NO_ID, "player_state");
        msg.writeString(this.steamID.toString());
        msg.writeInt(this.userID);
        msg.writeString(this.name);
        const hmd = (this.entity! as CBasePlayer).GetHMDAvatar()!;
        msg.writeVector(hmd.GetAbsOrigin());
        msg.writeVector(hmd.GetAnglesAsVector());
        return msg;
    }
}
