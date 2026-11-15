type PublishBody = {
	listId?: string;
};

export default defineEventHandler(async (event) => {
	const uid = await requireAuthUid(event);
	const body = await readBody<PublishBody>(event);
	const listId = typeof body?.listId === "string" ? body.listId.trim() : "";
	if (!listId) {
		throw createError({ statusCode: 400, message: "Missing listId." });
	}
	const origin = getRequestURL(event).origin;
	return publishListSnapshot(uid, listId, origin, event);
});