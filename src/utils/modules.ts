import { access, constants } from 'fs';
import { resolve } from 'path';

type RequireId = string | string[];

const nodeRequire = global.nodeRequire;

export const wrapArray = (value: RequireId): string[] => {
	return value?.length ? [value as string] : (value as string[]);
};

export const exists = (id: string): Promise<boolean> => {
	return new Promise((resolve) => {
		access(id, constants.F_OK, (error) => resolve(!error));
	});
};

export const crossRequire = async (
	id: RequireId,
	fallback?: unknown,
	req: NodeRequire | RequireResolve = nodeRequire,
): Promise<any> => {
	const moduleIds: [string, string][] = wrapArray(id).map((relativeId) => [
		resolve(process.cwd(), relativeId),
		resolve(__dirname, relativeId),
	]);

	for (const [projectId, cliId] of moduleIds) {
		if (await exists(projectId)) {
			return req(projectId);
		} else if (await exists(cliId)) {
			return req(cliId);
		}
	}

	return fallback;
};

export const crossResolve = async (
	id: string,
	fallback?: string,
): Promise<string> => {
	return (await crossRequire(id, fallback, nodeRequire.resolve)) || fallback;
};
