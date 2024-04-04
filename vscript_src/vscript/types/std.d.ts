interface table {
    [key: string]: any;
}

/**
 * Prints the provided values to console
 * 
 * @param messages - The messages to be printed.
 */
declare function print(this: void, ...messages: any[]): void;

/**
 * Requires a module and returns its exports.
 *
 * @param module - The name or path of the module to require.
 * @returns The exports of the required module.
 */
declare function require(this: void, module: string): any;

/**
 * Recursively prints the contents of a table.
 *
 * @param tbl - The table to be printed.
 * @param prefix - An optional prefix to prepend to each line of the printed table.
 * @returns The formatted string representation of the table.
 */
declare function DeepPrintTable(this: void, tbl: object, prefix?: string): any;


declare type UInt64 = number & IUInt64;

declare interface IUInt64 {
    /**
     * Performs bitwise AND between two integers.
     */
    BitwiseAnd(operand: UInt64): UInt64
    /**
     * Performs bitwise OR between two integers.
     */
    BitwiseOR(operand: UInt64): UInt64
    /**
     * Performs bitwise XOR between two integers.
     */
    BitwiseXor(operand: UInt64): UInt64
    /**
     * Performs bitwise NOT between two integers.
     */
    BitwiseNot(operand: UInt64): UInt64

    /**
     * Clears the specified bit.
     */
    ClearBit(operand: UInt64): UInt64
    /**
     * Checks if a bit is set.
     */
    IsBitSet(bitValue: UInt64): boolean
    /**
     * Sets the specified bit.
     */
    SetBit(bitValue: UInt64): UInt64
    /**
     * Toggles the specified bit.
     */
    ToggleBit(bitValue: UInt64): UInt64
    /**
     * Returns the hexadecimal string representation of the integer.
     */
    ToHexString(): string
}