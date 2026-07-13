import dotenv from 'dotenv';

dotenv.config();

// Normalize environment variable aliases that may be set in hosting UIs
// (e.g. a typo in Render's env keys). Map any known aliases to the
// canonical names used across the codebase.
const aliasMap = {
	CLOUDINARY_CLOUD_NAM: 'CLOUDINARY_CLOUD_NAME',
};

for (const [alias, canonical] of Object.entries(aliasMap)) {
	const aliasVal = process.env[alias];
	const canonicalVal = process.env[canonical];
	if (!canonicalVal && aliasVal) {
		process.env[canonical] = aliasVal;
		// Keep original alias intact but log mapping so deploy logs show it
		// (useful for debugging in Render logs)
		// eslint-disable-next-line no-console
		console.warn(`Mapped env ${alias} -> ${canonical}`);
	}
}

export default {};