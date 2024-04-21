import BattleshipBayMap from "../map/BattleshipBayMap";
export const __BundleAsGameScript = null;

let map: BattleshipBayMap;

export function OnInit(): void {
	map = new BattleshipBayMap();
	ScriptSystem_AddPerFrameUpdateFunction(onFrame);
}

export function OnPrecache(context: any) {
	map.onPrecache(context);
}

function onFrame() {
	map.update(FrameTime());
}
