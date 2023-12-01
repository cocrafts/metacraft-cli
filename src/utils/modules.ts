import { createPublicKey } from 'crypto';
import { access, constants } from 'fs';
import { resolve } from 'path';

import { isArray } from 'lodash';

type RequireId = string | string[];

const nodeRequire = global.nodeRequire;

export const wrapArray = (value: RequireId): string[] => {
	return isArray(value) ? value : [value];
};

export const exists = async (id: string): Promise<boolean> => {
	return new Promise((resolve) => {
		access(id, constants.F_OK, (error) => resolve(!error));
	});
};

export const crossRequire = async (
	id: RequireId,
	fallback?: unknown,
	req: NodeRequire | RequireResolve = nodeRequire,
): Promise<any> => {
	const moduleIds: [string, string, string][] = wrapArray(id).map(
		(relativeId) => [
			resolve(process.cwd(), relativeId),
			resolve(__dirname, relativeId),
			resolve(__dirname, '../../../', relativeId),
		],
	);

	for (const [projectId, localId, yarnGlobalId] of moduleIds) {
		if (await exists(projectId)) {
			return req(projectId);
		} else if (await exists(localId)) {
			return req(localId);
		} else if (await exists(yarnGlobalId)) {
			return req(yarnGlobalId);
		}
	}

	return fallback;
};

export const crossResolve = async (
	id: RequireId,
	fallback?: string,
): Promise<string> => {
	return (await crossRequire(id, fallback, nodeRequire.resolve)) || fallback;
};

export const isPackageDeclared = async (id: string) => {
	const packageJsonUri = resolve(process.cwd(), 'package.json');
	const packageJsonExists = await exists(packageJsonUri);

	if (packageJsonExists) {
		const packageJson = nodeRequire(packageJsonUri);

		for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
			if (packageJson[key]?.[id]) {
				return true;
			}
		}
	}

	return false;
};
