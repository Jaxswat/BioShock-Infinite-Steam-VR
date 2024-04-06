
export enum DefaultEvents {
    PlayerConnect = "player_connect",
    PlayerDisconnect = "player_disconnect",
    VrControllersConnected = "vr_controllers_connected"
}

/**
 * Fired when a player connects
 */
export interface PlayerConnectEvent {
    name: string; // player name
    index: number; // player slot (entity index-1)
    userid: number; // user ID on server (unique on server)
    networkid: string; // player network (i.e steam) id
    address: string; // ip:port
    bot: boolean; // is a bot or not
    xuid: number; // steamid
}

/**
 * Fired when a player disconnects
 */
export interface PlayerDisconnectEvent {
    userid: number; // user ID on server
    reason: number; // see networkdisconnect enum protobuf
    name: string; // player name
    networkid: string; // player network (i.e steam) id
    PlayerID: number;
    xuid: number; // steamid
}

/**
 * Fired when VR controllers are connected
 */
export interface VrControllersConnectedEvent {}