
/**
 * Linearly interpolate from a to b
 * @param t lerp factor, between 0 and 1
 * @param a
 * @param b
 * @returns the resulting value
 */
declare function Lerp(t: number, a: number, b: number): number;

declare function Deg2Rad(deg: number): number;
declare function Rad2Deg(rad: number): number;
declare function Clamp(val: number, min: number, max: number): number;

/**
 * Smooth curve decreasing slower as it approaches zero
 * @param inValue 
 * @param startValue 
 * @param lambda 
 */
declare function ExponentialDecay(inValue: number, startValue: number, lambda: number): number;


declare function RandomFloat(min: number, max: number): number;
declare function RandomInt(min: number, max: number): number;


declare function RotatePosition(rotationOrigin: Vector, rotationAngle: QAngle, vectorToRotate: Vector): Vector;