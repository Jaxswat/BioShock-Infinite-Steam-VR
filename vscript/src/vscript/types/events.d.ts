
declare function ListenToGameEvent(eventName: string, callback: any, obj: any): number;
declare function FireGameEvent(eventName: string, data: any): void;
declare function FireGameEventLocal(eventName: string, data: any): void;

declare interface CustomGameEventManager {
	RegisterListener(eventName: string, callback: any): number;
	Send_ServerToAllClients(eventName: string, data: any): void;
	Send_ServerToPlayer(player: CBasePlayer, eventName: string, data: any): void;
}


declare const CustomGameEventManager: CustomGameEventManager;