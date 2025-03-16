import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace} from "../../../utils/Trace";
import {findPath} from "../../../navigation/PathFinding";

export default class MoveComponent extends LizComponent {
	private readonly stepSpeed: number = 5;
	private readonly walkSpeed: number = 20;
	private readonly runSpeed: number = 70;
	private readonly speedLerpFactor: number = 10;

	private targetPosition: Vector;
	private currentSpeed: number;
	private targetSpeed: number;
	private lastYaw: number; // Yee haw?

	private path: Vector[];
	private currentPathIndex: number;

	public constructor(liz: Elizabeth) {
		super(liz);
		this.targetPosition = this.liz.getPosition();
		this.currentSpeed = 0;
		this.targetSpeed = 0;
		this.lastYaw = 0;

		this.path = [];
		this.currentPathIndex = 0;
	}

	public updatePose(delta: number): void {
		const entity = this.liz.getEntity();
		const currentPos = this.liz.getPosition();

		if (this.currentPathIndex < this.path.length) {
			const targetPos = this.path[this.currentPathIndex];
			const posSub = subVector(targetPos, currentPos);
			const direction = posSub.Normalized();
			direction.z = 0; // no flying bruv.
			const distance = posSub.Length();

			this.currentSpeed = Lerp(this.speedLerpFactor * delta, this.currentSpeed, this.targetSpeed);
			if (this.currentSpeed === 0) {
				return;
			}

			const speed = this.currentSpeed * delta;
			const nextPos = addVector(currentPos, mulVector(direction, speed as Vector));

			const traceStart = Vector(nextPos.x, nextPos.y, entity.GetCenter().z);
			const floorTrace = new LineTrace(traceStart, subVector(traceStart, Vector(0, 0, 1000)));
			floorTrace.setIgnoreEntity(entity);
			const floorTraceResult = floorTrace.run();
			if (floorTraceResult.hasHit()) {
				nextPos.z = floorTraceResult.getHitPosition().z;
			}

			this.liz.getEntity().ResetSequence("trotting_running");
			entity.SetAbsOrigin(nextPos);

			if (distance < 10) {
				this.currentPathIndex++;
				if (this.currentPathIndex < this.path.length) {
					this.targetPosition = this.path[this.currentPathIndex];
					this.liz.getLookAt().setTargetPosition(addVector(this.targetPosition, Vector(0, 0, this.liz.getHeadOffset())));
				} else {
					this.liz.getLookAt().setTargetPosition(addVector(this.targetPosition, Vector(0, 0, this.liz.getHeadOffset())));
					this.stop();
				}
			} else {
				const targetYaw = -Rad2Deg(Math.atan2(direction.x, direction.y)) + 90;
				const currentYaw = Lerp(10 * delta, entity.GetAngles().y, targetYaw);
				entity.SetAbsAngles(0, currentYaw, 0);
				this.lastYaw = currentYaw;
			}
		}
	}

	public moveTo(position: Vector): boolean {
		const startPos = this.liz.getPosition();
		const path = findPath(startPos, position);
		// let totalDistance = 0;
		// for (let i = 0; i < path.length - 1; i++) {
		//     totalDistance += VectorDistance(path[i], path[i + 1]);
		// }
		// const debugDrawDuration = (totalDistance / this.runSpeed);

		if (path.length > 0) {
			// for (let i = 0; i < path.length; i++) {
			//     if (i === 0) {
			//         print("start", path[i]);
			//     } else if (i === path.length - 1) {
			//         print("end", path[i]);
			//     } else {
			//         print("p" + i, path[i]);
			//     }
			//
			//     const point = path[i];
			//     DebugDrawSphere(point, Vector(0, 255, 255), 1, 5, true, debugDrawDuration);
			// }

			this.path = path;
			this.currentPathIndex = 0;
			this.targetPosition = path[0];
			this.targetSpeed = this.runSpeed;


			this.liz.getLookAt().setTargetPosition(addVector(path[0], Vector(0, 0, this.liz.getHeadOffset())));
			return true;
		} else {
			// print("no valid path found.");
		}

		return false;
	}

	public stop(): void {
		this.liz.getLookAt().setTargetModeEntity(true);
		this.liz.getEntity().ResetSequence("standing_idle");
		this.targetSpeed = 0;
		this.currentSpeed = 0;
	}

	public isAtTarget(): boolean {
		return VectorDistance(this.targetPosition, this.liz.getPosition()) < 10;
	}
}
