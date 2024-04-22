/**
 * Draws a debug overlay line.
 *
 * @param origin The starting point of the line.
 * @param target The ending point of the line.
 * @param r The red component of the line color (0-255).
 * @param g The green component of the line color (0-255).
 * @param b The blue component of the line color (0-255).
 * @param zTest Determines whether depth testing should be performed.
 * @param durationSeconds The duration, in seconds, that the line should be visible.
 */
declare function DebugDrawLine(origin: Vector, target: Vector, r: number, g: number, b: number, zTest: boolean, durationSeconds: number): void;

/**
 * Draws a debug sphere.
 * 
 * @param center The center of the sphere.
 * @param color The color of the sphere (0-255 rgb).
 * @param alpha The alpha transparency of the sphere (0-1).
 * @param radius The radius of the sphere.
 * @param zTest Determines whether depth testing should be performed.
 * @param durationSeconds The duration, in seconds, that the sphere should be visible.
 */
declare function DebugDrawSphere(center: Vector, color: Vector, alpha: number, radius: number, zTest: boolean, durationSeconds: number): void;

/**
 * Draws a debug overlay box
 *
 * @param origin The origin of the box.
 * @param mins The box mins.
 * @param maxs The box maxs.
 * @param r The red component of the box color (0-255).
 * @param g The green component of the box color (0-255).
 * @param b The blue component of the box color (0-255).
 * @param a The alpha component of the box color (0-1).
 * @param durationSeconds The duration, in seconds, that the box should be visible.
 */
declare function DebugDrawBox(origin: Vector, mins: Vector, maxs: Vector, r: number, g: number, b: number, a: number, durationSeconds: number): void;