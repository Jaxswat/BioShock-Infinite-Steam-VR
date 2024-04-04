import { LizTagClass } from "./lizEnums";

export interface LizGoalPoint {
	position: Vector;
}

export function getAllGoalPoints(): LizGoalPoint[] {
	let targets = Entities.FindAllByClassname("info_target");

	let goalPoints: LizGoalPoint[] = [];
	for (const target of targets) {
		const isLizPoint = target.Attribute_GetIntValue("liz_class", 0) === LizTagClass.Nav;

		if (isLizPoint) {
			const pos = target.GetAbsOrigin();
			goalPoints.push({
				position: pos
			});
		}
	}

	return goalPoints;
}

export function getGoalPointAtIndex(index: number): LizGoalPoint {
	const goalPoints = getAllGoalPoints();

	if (index >= goalPoints.length) {
		index = goalPoints.length - 1;
	}

	return goalPoints[index];
}

export function getNearestGoalPoint(fromPos: Vector): LizGoalPoint {
	let targets = Entities.FindAllByClassname("info_target");

	let nearestDist = 100000;
	let goalPos: Vector = Vector();
	for (const target of targets) {
		const isLizPoint = target.Attribute_GetIntValue("liz_class", 0) === LizTagClass.Nav;

		if (isLizPoint) {
			const targetPos = target.GetAbsOrigin();
			const dist = subVector(targetPos, fromPos).Length();
			if (dist < nearestDist) {
				goalPos = targetPos;
				nearestDist = dist;
			}
		}
	}

	return { position: goalPos };
}