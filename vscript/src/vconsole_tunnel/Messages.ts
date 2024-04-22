import {VTunnel, VTunnelMessage} from "./VTunnel";
import {LineTrace} from "../utils/Trace";

export function handleDrawDebugSphere(vmsg: VTunnelMessage){
    const position = vmsg.indexPartDataAsVector(0);
    const color= vmsg.indexPartDataAsVector(1);
    const colorAlpha = vmsg.indexPartDataAsFloat(2);
    const radius = vmsg.indexPartDataAsFloat(3);
    const zTest = vmsg.indexPartDataAsBoolean(4);
    const durationSeconds = vmsg.indexPartDataAsFloat(5);

    DebugDrawSphere(position, color, colorAlpha, radius, zTest, durationSeconds);
}

export function handleLineTrace(vmsg: VTunnelMessage){
    const startPosition = vmsg.indexPartDataAsVector(0);
    const endPosition = vmsg.indexPartDataAsVector(1);
    const mask = vmsg.indexPartDataAsInt(2);
    const ignoreEntityID = vmsg.indexPartDataAsInt(3);

    const trace = new LineTrace(startPosition, endPosition);
    trace.setMask(mask);
    if (ignoreEntityID !== 0) {
        // sure.
        const ent = Entities.FindAllInSphere(startPosition, 200)?.find(e => e!.GetEntityIndex() === ignoreEntityID);
        if (ent) {
            trace.setIgnoreEntity(ent);
        }
    }

    const result = trace.run();
    const vmsgResult = new VTunnelMessage(vmsg.getID(), "line_trace_result");
    vmsgResult.writeBoolean(result.hasHit());
    vmsgResult.writeVector(result.getHitPosition());
    vmsgResult.writeVector(result.getHitNormal());
    let hitEntityID = 0;
    if (result.hasHit() && result.hasEntityHit()) {
        hitEntityID = result.getEntityHit()!.GetEntityIndex();
    }
    vmsgResult.writeInt(hitEntityID);
    vmsgResult.writeBoolean(result.didStartInSolid());
    vmsgResult.writeFloat(result.getFraction());
    VTunnel.send(vmsgResult);

    // Debug
    DebugDrawLine(trace.getStartPosition(), result.getHitPosition(), 255, 0, 0, false, 5);
}
