interface Convars {
	GetBool(name: string): boolean;
	GetFloat(name: string): number;
	GetInt(name: string): number;
	GetStr(name: string): string;

	RegisterCommand(name: string, callback: (name: string, ...args: string[]) => void, helpString: string, flags: number): void;
}

declare const Convars: Convars;
