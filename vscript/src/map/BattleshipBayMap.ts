import {BioshockMap} from "./BioshockMap";
require('../navigation/baked/battleship_bay_nav'); // Load nav mesh
require('../events/BioshockEventSerializers'); // Register Bioshock events

export default class BattleshipBayMap extends BioshockMap {
    public constructor() {
        super();
        print("init finished for battleship_bay");
    }

    public onPrecache(context: any) {
        super.onPrecache(context);
        PrecacheSoundFile("soundevents_addon.vsndevts", context);
    }
}