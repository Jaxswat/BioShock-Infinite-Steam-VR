interface Convars {
	GetBool(name: string): boolean;
	GetFloat(name: string): number;
	GetInt(name: string): number;
	GetStr(name: string): string;
}

declare const Convars: Convars;
