/**
 * Returns the difference between two angles.
 *
 * @param a - The first angle in degrees.
 * @param b - The second angle in degrees.
 * @returns The difference in degrees.
 */
declare function AngleDiff(a: number, b: number): number;

/**
 * Converts a QAngle to a Vector.
 *
 * @param angle - The QAngle.
 */
declare function AnglesToVector(angle: QAngle): Vector;

/**
 * Converts a Vector to a QAngle.
 *
 * @param vec - The Vector.
 */
declare function VectorToAngles(vec: Vector): QAngle;
