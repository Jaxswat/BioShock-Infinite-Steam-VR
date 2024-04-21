import {VTunnelMessage} from "./VTunnel";


export function handleDrawDebugSphere(vmsg: VTunnelMessage){
    const position = vmsg.indexPartDataAsVector(0);
    const color= vmsg.indexPartDataAsVector(1);
    const colorAlpha = vmsg.indexPartDataAsFloat(2);
    const radius = vmsg.indexPartDataAsFloat(3);
    const zTest = vmsg.indexPartDataAsBoolean(4);
    const durationSeconds = vmsg.indexPartDataAsFloat(5);

    DebugDrawSphere(position, color, colorAlpha, radius, zTest, durationSeconds);
}
