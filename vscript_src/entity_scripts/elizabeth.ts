import Elizabeth from "../elizabeth/Elizabeth";
import { LizEventManager, LizEvent } from "../elizabeth/lizEvents";
import TickDelta from "../utils/TickDelta";

export const __BundleAsGameScript = null;

const logicUpdateRate = 60 / 1000; // Regular think logic can be slower
const poseUpdateRate = 100 / 1000; // Higher because pose updates need to be smooth

let liz: Elizabeth;
let tickDelta: TickDelta;
let poseDelta: TickDelta;

export function Spawn(this: void, entityKeyValues: any) {
    liz = new Elizabeth(thisEntity);
    tickDelta = new TickDelta();
    poseDelta = new TickDelta();

    liz.spawn();
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