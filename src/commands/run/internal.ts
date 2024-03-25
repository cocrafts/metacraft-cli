import { devEntries, guessEntry, nodeEntries, serverEntries } from 'utils/cli';
import type { MetacraftLogger } from 'utils/types';

interface RunEntries {
	nodeEntry?: string;
	webEntry?: string;
	serverEntry?: string;
}

export const guessEntries = async (
	logger: MetacraftLogger,
): Promise<RunEntries> => {
	const webEntry = await guessEntry(devEntries);
	const nodeEntry = await guessEntry(nodeEntries);
	const serverEntry = await guessEntry(serverEntries);

	if (!webEntry && !nodeEntry && !serverEntry) {
		logger.noEntry([...devEntries, ...nodeEntries].join('\n'));
	}

	return { nodeEntry, webEntry, serverEntry };
};
