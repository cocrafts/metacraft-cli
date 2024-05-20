import { writeFile } from 'fs/promises';

import { Client, Item, ItemField } from '@1password/sdk';
import { extractInternals, loadEnvironments, parseConfigs } from 'utils/cli';
import { RootOptions } from 'utils/configs';
import { type CommandModule } from 'yargs';

const module: CommandModule<object, RootOptions> = {
	command: 'getVault',
	aliases: ['vault'],
	describe: 'Get vault/environments',
	handler: async (args) => {
		await loadEnvironments(
			args.environment as string,
			args.environmentFile as string,
		);

		const { modules, configs } = await extractInternals();
		const { onePassword, ansiColors: colors } = modules;
		const { vaultOptions } = parseConfigs(configs, args);
		const client: Client = await onePassword.createClient(
			vaultOptions.onePassword,
		);

		const vaultIds = vaultOptions?.onePassword?.vaultIds || [];
		const vaultPromises: Promise<Item>[] = [];
		for (const idPair of vaultIds) {
			const [vaultId, itemId] = idPair.split('/');
			const promise = client.items.get(vaultId, itemId);
			vaultPromises.push(promise);
		}

		const fieldMap: Record<string, ItemField> = {};
		const results = await Promise.allSettled(vaultPromises);

		for (let i = 0; i < results.length; i += 1) {
			const result = results[i];

			if (result.status === 'fulfilled') {
				for (const field of result.value.fields) {
					if (field.title?.length > 0 && field.field_type !== 'Unsupported') {
						fieldMap[field.title] = field;
					}
				}
			} else {
				const vaultId = vaultIds[i];
				console.log(`Failed to get vault ${colors.gray(vaultId)}`);
			}
		}

		for (const field of Object.values(fieldMap)) {
			console.log(`generating ${colors.gray(field.title)}`);
			await writeFile(field.title, field.value);
		}

		vaultOptions?.callback?.(fieldMap, client);
	},
};

export default module;
