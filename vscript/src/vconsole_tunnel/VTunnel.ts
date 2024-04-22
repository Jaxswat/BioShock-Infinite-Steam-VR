import {ConVarFlags} from "../utils/ConVars";

enum VTunnelDataType {
    String = "s",
    Float = "f",
    Int = "i",
    Vector = "v3",
    Boolean = "b"
}

export interface VTunnelSerializable {
    serialize(): VTunnelMessage;
}

export class VTunnelMessage {
    public static readonly NO_ID = 0;

    private id = 0;
    private name: string;
    private partTypes: VTunnelDataType[];
    private partData: any[];

    public constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.partTypes = [];
        this.partData = [];
    }

    public getID(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getPartCount(): number {
        return this.partTypes.length;
    }

    public indexPartTypes(i: number): VTunnelDataType {
        return this.partTypes[i];
    }

    public indexPartData(i: number): any {
        return this.partData[i];
    }

    public indexPartDataAsString(i: number): string {
        return this.partData[i] as string;
    }

    public indexPartDataAsInt(i: number): number {
        return this.partData[i] as number;
    }

    public indexPartDataAsFloat(i: number): number {
        return this.partData[i] as number;
    }

    public indexPartDataAsVector(i: number): Vector {
        return this.partData[i] as Vector;
    }

    public indexPartDataAsBoolean(i: number): boolean {
        return this.partData[i] as boolean;
    }

    public writeString(data: string): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.String);
        this.partData.push(data);
        return this;
    }

    public writeFloat(data: number): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.Float);
        this.partData.push(data);
        return this;
    }

    public writeInt(data: number): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.Int);
        this.partData.push(data);
        return this;
    }

    public writeVector(data: Vector): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.Vector);
        this.partData.push(data);
        return this;
    }

    public writeBoolean(data: boolean): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.Boolean);
        this.partData.push(data);
        return this;
    }

    public writeUInt64(data: UInt64): VTunnelMessage {
        this.partTypes.push(VTunnelDataType.Int);
        this.partData.push(data.toString());
        return this;
    }
}

export abstract class VTunnel {
    public static readonly VTUNNEL_PREFIX = "$vt!";
    public static readonly VTUNNEL_TYPE_PREFIX = ":";
    public static readonly VTUNNEL_TYPE_SUFFIX = "!";

    private constructor() {
    }

    public static send(message: VTunnelMessage): void {
        const payloadParts = [
            VTunnel.VTUNNEL_PREFIX,
            message.getID(), VTunnel.VTUNNEL_TYPE_SUFFIX,
            message.getName(), VTunnel.VTUNNEL_TYPE_SUFFIX
        ];

        const partCount = message.getPartCount();
        for (let i = 0; i < partCount; i++) {
            let partType = message.indexPartTypes(i);
            let partData = message.indexPartData(i);

            payloadParts.push(partType);
            if (partType === VTunnelDataType.String) {
                payloadParts.push('(');
                payloadParts.push(((partData || 0) as any as string).length as any as string); // Embrace the type system (force # operator in lua)
                payloadParts.push(')');
            }

            payloadParts.push(this.VTUNNEL_TYPE_PREFIX);
            switch (partType) {
                case VTunnelDataType.String:
                    payloadParts.push(partData);
                    break;
                case VTunnelDataType.Float:
                    payloadParts.push(partData);
                    break;
                case VTunnelDataType.Int:
                    payloadParts.push(partData); // Let server decide how to round this
                    break;
                case VTunnelDataType.Vector:
                    payloadParts.push(partData.x);
                    payloadParts.push(',');
                    payloadParts.push(partData.y);
                    payloadParts.push(',');
                    payloadParts.push(partData.z);
                    break;
                case VTunnelDataType.Boolean:
                    payloadParts.push(partData ? '1' : '0');
                    break;
            }
            payloadParts.push(VTunnel.VTUNNEL_TYPE_SUFFIX);
        }

        print(payloadParts.join(''));
    }

    public static receive(rawData: string): VTunnelMessage | null {
        if (!rawData.startsWith(VTunnel.VTUNNEL_PREFIX)) {
            return null;
        }

        let index = VTunnel.VTUNNEL_PREFIX.length;
        const idIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
        const msgID = parseInt(rawData.substring(index, idIndex), 10);
        index = idIndex + 1;
        const nameIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
        const msgName = rawData.substring(index, nameIndex);
        index = nameIndex + 1;

        const vmsg = new VTunnelMessage(msgID, msgName);

        let stringLength = 0;
        let dataType = "";
        let data = "";
        while (index < rawData.length) {
            const c = rawData[index];

            if (dataType == "") {
                if (c == VTunnel.VTUNNEL_TYPE_PREFIX) {
                    dataType = data;
                    if (dataType.startsWith("s(") && dataType.endsWith(")")) {
                        stringLength = parseInt(dataType.substring(2, dataType.length - 1), 10);
                        dataType = VTunnelDataType.String;
                    }

                    data = "";
                    index++;
                    continue;
                }

                data += c;
                index++;
                continue;
            }

            let endIndex = 0;
            switch (dataType) {
                case VTunnelDataType.String:
                    vmsg.writeString(rawData.substring(index, index + stringLength));
                    index += stringLength;
                    break;
                case VTunnelDataType.Float:
                    endIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
                    data = rawData.substring(index, endIndex);
                    vmsg.writeFloat(parseFloat(data));
                    index = endIndex;
                    break;
                case VTunnelDataType.Int:
                    endIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
                    data = rawData.substring(index, endIndex);
                    vmsg.writeFloat(parseInt(data, 10));
                    index = endIndex;
                    break;
                case VTunnelDataType.Vector:
                    endIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
                    data = rawData.substring(index, endIndex);
                    const xyz = data.split(',');
                    vmsg.writeVector(Vector(parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2])));
                    index = endIndex;
                    break;
                case VTunnelDataType.Boolean:
                    endIndex = rawData.indexOf(VTunnel.VTUNNEL_TYPE_SUFFIX, index);
                    data = rawData.substring(index, endIndex);
                    vmsg.writeBoolean(data == "1");
                    index = endIndex;
                    break;
            }

            dataType = "";
            data = "";
            index++;
        }

        return vmsg;
    }
}

export class VTunnelReceiver {
    public constructor(onMessageReceived: (message: VTunnelMessage) => void) {
        Convars.RegisterCommand("vtunnel_receive", (_: string, ...args: string[]) => {
            if (args.length != 1) {
                return;
            }

            const vmsg = VTunnel.receive(args[0]);
            if (vmsg) {
                onMessageReceived(vmsg);
            }
        }, "Receives a VTunnel message", ConVarFlags.FCVAR_HIDDEN_AND_UNLOGGED);
    }
}
