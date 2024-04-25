interface Convars {
	GetBool(name: string): boolean;
	GetFloat(name: string): number;
	GetInt(name: string): number;
	GetStr(name: string): string;

	RegisterCommand(name: string, callback: (name: string, ...args: string[]) => void, helpText: string, flags: number): void;
	RegisterConvar(name: string, defaultValue: string, helpText: string, flags: number): void;
}

declare const Convars: Convars;
