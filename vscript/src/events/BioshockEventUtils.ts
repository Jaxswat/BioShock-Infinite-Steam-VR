export function splitEventDataIntoNumbers(flatData: string): number[] {
	return flatData.split(',').map(n => parseInt(n, 10));
}
