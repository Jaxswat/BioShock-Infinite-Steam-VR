import { Skyline } from '../entities/skyline/skyline';
import BioshockPlayer from "../entities/BioshockPlayer";
import {DefaultEvents, PlayerConnectEvent, PlayerDisconnectEvent} from "../utils/DefaultEvents";
import Timer from "../utils/Timer";

export abstract class BioshockMap {
	protected skylines: Skyline[];
	protected players: BioshockPlayer[];
	private playerCheckTimer: Timer;

	public constructor() {
		this.skylines = [];
		this.players = [];
		this.playerCheckTimer = new Timer(1);
	}

	public addSkyline(skyline: Skyline) {
		this.skylines.push(skyline);
	}

	/**
	 * Called when the script system loads
	 */
	public onInit() {
		ListenToGameEvent(DefaultEvents.PlayerConnect, this.onPlayerConnect, this);
		ListenToGameEvent(DefaultEvents.PlayerDisconnect, this.onPlayerDisconnect, this);
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
				const player = this.players.find(player => !player.hasConnected() && player.getUserID() === entity.GetUserID());
				if (player) {
					player.setEntity(entity);
					player.onConnect();
				}
			}
		}

		for (let player of this.players) {
			if (player.hasConnected()) {
				player.update(delta);
			}
		}
	}

	/**
	 * Called when a player connects
	 */
	public onPlayerConnect(event: PlayerConnectEvent) {
		const player = new BioshockPlayer(event);
		this.players.push(player);
	}

	/**
	 * Called when a player disconnects
	 */
	public onPlayerDisconnect(event: PlayerDisconnectEvent) {
		const index = this.players.findIndex(player => player.getConnectEvent().networkid === event.networkid);
		this.players[index].onDisconnect();
		if (index !== -1) {
			this.players.splice(index, 1);
		}
	}
}
