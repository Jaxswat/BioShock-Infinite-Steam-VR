import {LizTagClass} from "./lizEnums";

export interface LizChoreoPoint {
    id: number;
    sequenceName: string;
    position: Vector;
    rotation: QAngle;
    activateDistance: number;
}

export abstract class LizChoreoUtils {
    private static choreoPrefix: string = "liz_choreo_";
    private static idSequence: number = 0;

    public static findAllChoreoPoints(): LizChoreoPoint[] {
        const points: LizChoreoPoint[] = [];
        let currentEntity: CBaseEntity | null = Entities.First();
        while (currentEntity !== null) {
            const isLizChoreoPoint = currentEntity.Attribute_GetIntValue("liz_class", 0) === LizTagClass.Choreo;

            if (isLizChoreoPoint) {
                const point: LizChoreoPoint = {
                    id: ++this.idSequence,
                    sequenceName: currentEntity.GetName().substring(this.choreoPrefix.length),
                    position: currentEntity.GetAbsOrigin(),
                    rotation: currentEntity.GetAngles(),
                    activateDistance: currentEntity.Attribute_GetFloatValue("liz_choreo_activate_distance", 100)
                };

                points.push(point);
            }

            currentEntity = Entities.Next(currentEntity);
        }

        return points;
    }

    public static getNearestChoreoPoint(lizPos: Vector, points: LizChoreoPoint[]): LizChoreoPoint | null {
        let nearestPoint: LizChoreoPoint | null = null;
        let nearestDist = 10000;
        for (const point of points) {
            const dist = VectorDistance(point.position, lizPos);
            if (dist < nearestDist) {
                nearestPoint = point;
                nearestDist = dist;
            }
        }

        return nearestPoint;
    }
}