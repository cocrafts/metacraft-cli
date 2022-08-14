import { guessEntry, nodeEntries, webEntries } from 'utils/cli';
import type { MetacraftLogger } from 'utils/types';

interface RunEntries {
	nodeEntry?: string;
	webEntry?: string;
}

const packageJson = global.packageJson;

export const guessEntries = async (
	logger: MetacraftLogger,
): Promise<RunEntries> => {
	const webEntry = await guessEntry(webEntries);
	const nodeEntry = await guessEntry(nodeEntries);

	logger.greeting(packageJson.version);

	if (!webEntry && !nodeEntry) {
		logger.noEntry([...webEntries, ...nodeEntries].join(', '));
	}

	return { nodeEntry, webEntry };
};
