import { Skyline } from '../entities/skyline/skyline';
import BioshockPlayer from "../entities/BioshockPlayer";
import {DefaultEvents, PlayerConnectEvent, PlayerDisconnectEvent} from "../utils/DefaultEvents";
import Timer from "../utils/Timer";
import {VTunnel, VTunnelMessage, VTunnelSerializable} from "../vconsole_tunnel/VTunnel";
import {regigerDefaultVTunnelMessageHandlers} from "../vconsole_tunnel/MessageHandlers";

export abstract class BioshockMap implements VTunnelSerializable {
	protected skylines: Skyline[];
	protected players: Map<number, BioshockPlayer>;
	private playerCheckTimer: Timer;

	public constructor() {
		this.skylines = [];
		this.players = new Map();
		this.playerCheckTimer = new Timer(1);

		ListenToGameEvent(DefaultEvents.PlayerConnect, this.onPlayerConnect, this);
		ListenToGameEvent(DefaultEvents.PlayerDisconnect, this.onPlayerDisconnect, this);

		VTunnel.setup();
		regigerDefaultVTunnelMessageHandlers();
		VTunnel.requestHandshake();
	}

	public addSkyline(skyline: Skyline) {
		this.skylines.push(skyline);
	}

	/**
	 * Called when assets are precached
	 */
	public onPrecache(context: any) {}

	/**
	 * Called when the map is activated
	 */
	public onActivate() {}

	public update(delta: number) {
		this.playerCheckTimer.tick(delta);
		if (this.playerCheckTimer.isDone()) {
			this.playerCheckTimer.reset();

			const allPlayerEntities = Entities.FindAllByClassname("player") as CBasePlayer[];
			for (let entity of allPlayerEntities) {
				const userID = entity.GetUserID();
				const player = this.players.get(userID);
				if (player && !player.hasConnected()) {
					player.setEntity(entity);
					player.onConnect();
				} else if (!player) {
					// Can't seem to get player_connect to work for the room's host.
					const initialPlayerEvent = {
						userid: userID,
						name: "" + userID,
					} as unknown as PlayerConnectEvent;
					const player = new BioshockPlayer(initialPlayerEvent);
					this.players.set(player.getUserID(), player);
					player.setEntity(entity);
					player.onConnect();
				}
			}
		}

		for (let [_, player] of this.players) {
			if (player.hasConnected()) {
				player.update(delta);
			}
		}

		// VTunnel.send(this.serialize());
	}

	/**
	 * Called when a player connects
	 */
	public onPlayerConnect(event: PlayerConnectEvent) {
		const player = new BioshockPlayer(event);
		this.players.set(player.getUserID(), player);
	}

	/**
	 * Called when a player disconnects
	 */
	public onPlayerDisconnect(event: PlayerDisconnectEvent) {
		const userID = event.userid;
		const player = this.players.get(userID);
		if (player) {
			player.onDisconnect();
			this.players.delete(userID);
		}
	}

	public serialize(): VTunnelMessage {
		const msg = new VTunnelMessage(VTunnelMessage.NO_ID, "world_state");
		msg.writeFloat(Time());
		return msg;
	}
}
