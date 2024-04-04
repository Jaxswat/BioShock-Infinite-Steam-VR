import {BioshockMap} from "./BioshockMap";
import {Skyline} from "../skyline/skyline";

export default class BattleshipBayMap extends BioshockMap {
    private readonly skylineOrigin = Vector(6450.64, -3950.89, 1500.97);
    private readonly pathScale = 25;

    private testSkyline: Skyline;

    public constructor() {
        super();

        const testSkylinePoints = [
            addVector(this.skylineOrigin, Vector(0, 0, 0)),
            addVector(this.skylineOrigin, Vector(this.pathScale, 0, this.pathScale / 3)),
            addVector(this.skylineOrigin, Vector(this.pathScale * 2, 0, 0)),

            addVector(this.skylineOrigin, Vector(this.pathScale * 2, -this.pathScale, this.pathScale / 2)),

            addVector(this.skylineOrigin, Vector(this.pathScale * 2, -this.pathScale * 2, this.pathScale)),
            addVector(this.skylineOrigin, Vector(this.pathScale, -this.pathScale * 2, this.pathScale)),
            addVector(this.skylineOrigin, Vector(0, -this.pathScale * 2, this.pathScale)),
        ];

        this.testSkyline = new Skyline(testSkylinePoints, true);
        this.addSkyline(this.testSkyline);
    }

    public onPrecache(context: any) {
        super.onPrecache(context);
        PrecacheSoundFile("soundevents_addon.vsndevts", context);
    }

    public onInit(): void {
        super.onInit();
        print("init finished for battleship_bay");
    }

    private percentSpeed = 0.1;
    private percentAlong = 0;
    private percentReverse = false;
    public update(delta: number) {
        super.update(delta);

        this.testSkyline.DebugDrawSkylineSpline();

        let speed = this.percentSpeed * delta;

        // if (percentAlong >= 1) {
        // 	percentReverse = true;
        // } else if (percentAlong <= 0) {
        // 	percentReverse = false;
        // }

        if (this.percentReverse) {
            this.percentAlong -= speed;
        } else {
            this.percentAlong += speed;
        }

        let point = this.testSkyline.getPointOnSpline(this.percentAlong);
        let tangent = this.testSkyline.getTangentAtPoint(this.percentAlong, !this.percentReverse);
        let rotation = this.testSkyline.calculatePointRotation(tangent, 1);

        const worldUpVector = Vector(0, 0, 1);
        const rightVector = tangent.Cross(worldUpVector).Normalized();
        const upVector = rightVector.Cross(tangent).Normalized();
        const dotAngle = (-upVector as Vector).Dot(Vector(0, 0, -1));

        DebugDrawSphere(point, Vector(0, 255, 255), 1, 3, true, delta); // center point
        DebugDrawLine(point, addVector(point, mulVector(tangent, 5 as Vector)), 255, 0, 0, true, delta); // curve forward
        DebugDrawLine(point, addVector(point, mulVector(upVector, 5 as Vector)), 0, 0, 255, true, delta); // curve down
        DebugDrawSphere(addVector(point, mulVector(upVector, -3 as Vector)), Vector(0, 0, 255), 1, 3, true, delta);
    }
}