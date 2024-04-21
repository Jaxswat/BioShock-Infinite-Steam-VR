export enum ConVarFlags {
    FCVAR_NONE = 0,

    FCVAR_DEVELOPMENTONLY = 2,

    FCVAR_HIDDEN = 16,

    /**
     * Makes the ConVar value hidden from all clients (for example sv_password).
     *
     * Reported as "prot" by cvarlist.
     */
    FCVAR_PROTECTED = 32,

    /**
     * Executing the command or changing the ConVar is only allowed in singleplayer.
     *
     * Reported as "sp" by cvarlist.
     */
    FCVAR_SPONLY = 64,

    /**
     * Save the ConVar value into config.cfg.
     *
     * Reported as "a" by cvarlist, except Lua ConVars.
     */
    FCVAR_ARCHIVE = 128,

    /**
     * For serverside ConVars, notifies all players with blue chat text when the value
     * gets changed.
     *
     * Reported as "nf" by cvarlist.
     */
    FCVAR_NOTIFY = 256,

    /**
     * For clientside commands, sends the value to the server.
     *
     * Reported as "user" by cvarlist.
     */
    FCVAR_USERINFO = 512,

    /**
     * Don't log the ConVar changes to console/log files/users.
     *
     * Reported as "log" by cvarlist.
     */
    FCVAR_UNLOGGED = 2048,

    /**
     * For serverside ConVars, it will send its value to all clients. The ConVar with
     * the same name must also exist on the client!
     *
     * Reported as "rep" by cvarlist.
     */
    FCVAR_REPLICATED = 8192,

    /**
     * Requires sv_cheats to be enabled to change the ConVar or run the command.
     *
     * Reported as "cheat" by cvarlist.
     */
    FCVAR_CHEAT = 16384,

    FCVAR_PER_USER = 32768,

    /**
     * Force the ConVar to be recorded by demo recordings.
     *
     * Reported as "demo" by cvarlist.
     */
    FCVAR_DEMO = 65536,

    /**
     * Opposite of FCVAR_DEMO, ensures the ConVar is not recorded in demos.
     *
     * Reported as "norecord" by cvarlist.
     */
    FCVAR_DONTRECORD = 131072,

    /**
     * Makes the ConVar not changeable while connected to a server or in singleplayer.
     */
    FCVAR_NOT_CONNECTED = 4194304,

    FCVAR_VCONSOLE_SET_FOCUS = 134217728,

    FCVAR_HIDDEN_AND_UNLOGGED = 2064,
}
