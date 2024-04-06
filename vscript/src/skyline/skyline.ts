export class Skyline {

	private points: Vector[]

	constructor(points: Vector[], makeLoop: boolean) {
		this.points = points;

		if (makeLoop) {
			const firstPoint = points[0];
			const lastPoint = points[points.length - 1];
			const loopPoint = VectorLerp(0.5, lastPoint, firstPoint);
			this.points.push(loopPoint);
		}
	}

	public DebugDrawSkylineSpline() {
		for (const point of this.points) {
			DebugDrawSphere(point, Vector(255, 0, 0), 1, 3, true, FrameTime());
		}
	}

	public getPointOnSpline(percent: number): Vector {
		// percent = Clamp(percent % 1, 0, 1);
		const numPoints = this.points.length;

		if (numPoints == 0) {
			return Vector();
		} else if (numPoints == 1) {
			return this.points[0];
		} else if (numPoints === 2) {
			const p0 = this.points[0];
			const p1 = this.points[1];
			return VectorLerp(percent, p0, p1);
		}

		const segmentCount = numPoints - 1;
		const segment = Math.floor(percent * segmentCount);

		const t = percent * segmentCount - segment;

		const p0 = this.points[(segment - 1 + numPoints) % numPoints];
		const p1 = this.points[segment % numPoints];
		const p2 = this.points[(segment + 1) % numPoints];
		const p3 = this.points[(segment + 2) % numPoints];
		// let p0, p1, p2, p3;
		// if (percent === 0) {
		// 	p0 = this.points[0];
		// 	p1 = this.points[0];
		// 	p2 = this.points[1];
		// 	p3 = this.points[2];
		// } else if (percent === 1) {
		// 	p0 = this.points[numPoints - 3];
		// 	p1 = this.points[numPoints - 2];
		// 	p2 = this.points[numPoints - 1];
		// 	p3 = this.points[numPoints - 1];
		// } else {
		// 	p0 = this.points[Math.max(segment - 1, 0)];
		// 	p1 = this.points[segment];
		// 	p2 = this.points[Math.min(segment + 1, numPoints - 1)];
		// 	p3 = this.points[Math.min(segment + 2, numPoints - 1)];
		// }

		const t2 = t * t;
		const t3 = t * t2;

		const x = this.interpolate(p0.x, p1.x, p2.x, p3.x, t, t2, t3);
		const y = this.interpolate(p0.y, p1.y, p2.y, p3.y, t, t2, t3);
		const z = this.interpolate(p0.z, p1.z, p2.z, p3.z, t, t2, t3);

		return Vector(x, y, z);
	}

	public getTangentAtPoint(percent: number, forward: boolean): Vector {
		const epsilon = 0.01;
		const point1 = this.getPointOnSpline(Math.max(percent - epsilon, 0));
		const point2 = this.getPointOnSpline(Math.min(percent + epsilon, 1));
		if (forward) {
			return subVector(point2, point1).Normalized()
		} else {
			return subVector(point1, point2).Normalized()
		}
	}

	public calculatePointRotation(tangentVector: Vector, speedFactor: number): QAngle {
		const globalUpVector = Vector(0, 0, 1); // Define your "up" or "down" direction vector (Z-positive)
		const globalRightVector = Vector(0, 1, 0);

		// Calculate the cross product between the tangent vector and the "up" vector
		const upVector = tangentVector.Cross(globalUpVector).Normalized();
		const rightVector = tangentVector.Cross(globalRightVector).Normalized();


		const curveDirection = upVector.y >= 0 ? 1 : -1;
		// Calculate the angle of rotation based on the speed factor
		const maxRotationAngle = Math.PI / 4; // Adjust this value as needed
		const rotationAngle = maxRotationAngle * curveDirection * speedFactor;

		// Create a rotation Euler angles around the perpendicular axis
		const rotation = QAngle(
			Rad2Deg(Math.atan2(upVector.z, upVector.y)),
			Rad2Deg(Math.atan2(-upVector.x, Math.sqrt(upVector.y * upVector.y + upVector.z * upVector.z))),
			Rad2Deg(rotationAngle)
		);

		return rotation;
	}

	private interpolate(
		p0: number,
		p1: number,
		p2: number,
		p3: number,
		t: number,
		t2: number,
		t3: number
	): number {
		const c0 = p1;
		const c1 = 0.5 * (p2 - p0);
		const c2 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
		const c3 = 0.5 * (p3 - p0) + 1.5 * (p1 - p2);

		return c0 + c1 * t + c2 * t2 + c3 * t3;
	}
}
