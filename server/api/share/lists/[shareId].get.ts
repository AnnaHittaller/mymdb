export default defineEventHandler(async (event) => {
	const shareId = getRouterParam(event, "shareId")?.trim() ?? "";
	if (!shareId || !isShareId(shareId)) {
		throw createError({ statusCode: 400, message: "Invalid share link." });
	}
	const snapshot = await readPublicListSnapshot(shareId, event);
	if (!snapshot) {
		throw createError({ statusCode: 404, message: "This shared list was not found." });
	}
	return snapshot;
});