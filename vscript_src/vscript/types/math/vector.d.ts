/**
 * Represents a 3D vector with `x`, `y`, and `z` components.
 */
type Vector = number & IVector;

/**
 * Interface representing a 3D vector.
 */
declare interface IVector {
	/**
	 * The x-component of the vector.
	 */
	x: number;

	/**
	 * The y-component of the vector.
	 */
	y: number;

	/**
	 * The z-component of the vector.
	 */
	z: number;

	/**
	 * Calculates the dot product between this vector and another vector.
	 *
	 * @param vec - The other vector for the dot product calculation.
	 * @returns The dot product of the two vectors.
	 */
	Dot(vec: Vector): number;

	/**
	 * Calculates the cross product between this vector and another vector.
	 *
	 * @param vec - The other vector for the cross product calculation.
	 * @returns The cross product of the two vectors.
	 */
	Cross(vec: Vector): Vector;

	/**
	 * Calculates the length of the vector.
	 *
	 * @returns The length of the vector.
	 */
	Length(): number;

	/**
	 * Calculates the length of the vector in the XY plane.
	 *
	 * @returns The length of the vector in the XY plane.
	 */
	Length2D(): number;

	/**
	 * Returns a normalized (unit-length) version of the vector.
	 *
	 * @returns The normalized vector.
	 */
	Normalized(): Vector;
}

/**
 * Creates a new Vector object.
 *
 * @param x - The x-component of the vector. Defaults to 0 if not specified.
 * @param y - The y-component of the vector. Defaults to 0 if not specified.
 * @param z - The z-component of the vector. Defaults to 0 if not specified.
 * @returns A new Vector object.
 */
declare function Vector(this: void, x?: number, y?: number, z?: number): Vector;

declare const addVector: LuaAddition<Vector, Vector, Vector>;
declare const subVector: LuaSubtraction<Vector, Vector, Vector>;
declare const mulVector: LuaMultiplication<Vector, Vector, Vector>;
declare const divVector: LuaDivision<Vector, Vector, Vector>;

declare function VectorDistanceSq(a: Vector, b: Vector): number;
declare function VectorDistance(a: Vector, b: Vector): number;
declare function VectorLerp(t: number, a: Vector, b: Vector): Vector;
declare function VectorIsZero(v: Vector): boolean;

declare function SplineVectors(a: Vector, b: Vector, t: number): Vector; // is this different from VectorLerp?
