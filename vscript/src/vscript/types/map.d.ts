/**
 * Registers a function to be called every frame. Only usable in map script context.
 * @param updateFunction 
 */
declare function ScriptSystem_AddPerFrameUpdateFunction(updateFunction: Function): void;