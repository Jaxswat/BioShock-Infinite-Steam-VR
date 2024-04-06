import { LizTagClass } from "./lizEnums";

export interface LizCuriousityPoint {
	id: number;
	position: Vector;
	sentiment: number;
	smelly: boolean;
}

export abstract class LizCuriousityUtils {
	private static idSequence = 0;
	public static findAllCuriousityPoints(): LizCuriousityPoint[] {
		const points: LizCuriousityPoint[] = [];
		let currentEntity: CBaseEntity | null = Entities.First();
		while (currentEntity !== null) {
			const isLizCuriousityPoint = currentEntity.Attribute_GetIntValue("liz_class", 0) === LizTagClass.Curious;

			if (isLizCuriousityPoint) {
				const point = {
					id: ++this.idSequence,
					position: currentEntity.GetAbsOrigin(),
					sentiment: currentEntity.Attribute_GetFloatValue("liz_curious_sentiment", 0.5),
					smelly: currentEntity.Attribute_GetIntValue("liz_curious_smelly", 0) === 1
				};

				points.push(point);
			}

			currentEntity = Entities.Next(currentEntity);
		}

		return points;
	}

	public static getNearestCuriosityPoint(lizPos: Vector, points: LizCuriousityPoint[], usedPoints: Set<number>): LizCuriousityPoint | null {
		let nearestPoint: LizCuriousityPoint | null = null;
		let nearestDist = 10000;
		for (const point of points) {
			if (!usedPoints.has(point.id)) {
				const dist = VectorDistance(point.position, lizPos);
				if (dist < nearestDist) {
					nearestPoint = point;
					nearestDist = dist;
				}
			}
		}

		return nearestPoint;
	}
}