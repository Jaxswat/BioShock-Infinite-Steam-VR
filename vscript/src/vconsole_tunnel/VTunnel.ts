
enum VTunnelDataType {
    String = "s",
    Float = "f",
    Int = "i",
    Vector = "v3",
}

export interface VTunnelSerializable {
    serialize(): VTunnelMessage;
}

export class VTunnelMessage {
    private name: string = "";
    private partTypes: VTunnelDataType[] = [];
    private partData: any[] = [];

    public constructor(name: string) {
        this.name = name;
        this.partTypes = [];
        this.partData = [];
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
}

export abstract class VTunnel {
    public static readonly VTUNNEL_PREFIX = "$vt!";
    public static readonly VTUNNEL_TYPE_PREFIX = ":";
    public static readonly VTUNNEL_TYPE_SUFFIX = "!";

    private constructor() {
    }

    public static send(message: VTunnelMessage): void {
        const payloadParts = [VTunnel.VTUNNEL_PREFIX, message.getName(), VTunnel.VTUNNEL_TYPE_SUFFIX];

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
            }
            payloadParts.push(VTunnel.VTUNNEL_TYPE_SUFFIX);
        }

        print(payloadParts.join(''));
    }
}
