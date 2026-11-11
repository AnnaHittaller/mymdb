export type SystemListId = "favorites" | "watch-next";

export type UserList = {
	id: string;
	kind: "system" | "custom";
	name: string;
	renamable: boolean;
	createdAt: Date;
};

export type ListMembership = {
	listId: string;
	joinedAt: Date;
};
