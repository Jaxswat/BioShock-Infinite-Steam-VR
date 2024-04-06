import BattleshipBayMap from "../map/BattleshipBayMap";
export const __BundleAsGameScript = null;

const map = new BattleshipBayMap();

export function OnPrecache(context: any) {
	map.onPrecache(context);
}

export function OnInit(): void {
	map.onInit();
	ScriptSystem_AddPerFrameUpdateFunction(onFrame);
}

function onFrame() {
	map.update(FrameTime());
}
