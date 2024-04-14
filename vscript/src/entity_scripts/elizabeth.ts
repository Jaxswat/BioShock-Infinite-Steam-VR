import Elizabeth from "../entities/elizabeth/Elizabeth";
import TickDelta from "../utils/TickDelta";

export const __BundleAsGameScript = null;

const logicUpdateRate = 1 / 15; // 15 tps. Regular think logic can be slower.
const poseUpdateRate = 1 / 100; // 100 tps. Higher because pose updates need to be smooth.

let liz: Elizabeth;
let tickDelta: TickDelta;
let poseDelta: TickDelta;

export function Spawn(this: void, entityKeyValues: any) {
    liz = new Elizabeth(thisEntity);

    tickDelta = new TickDelta();
    poseDelta = new TickDelta();
    liz.getEntity().SetThink(ThinkLogic, "logic", logicUpdateRate);
    liz.getEntity().SetThink(ThinkPose, "pose", poseUpdateRate);
}

function ThinkLogic() {
    const delta = tickDelta.tick();
    liz.update(delta);

    return logicUpdateRate;
}

function ThinkPose() {
    const delta = poseDelta.tick();
    liz.updatePose(delta);

    return poseUpdateRate;
}