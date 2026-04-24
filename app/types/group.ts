export enum GroupRole {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}

export interface GroupMember {
	userID?: string;
	username?: string;
	role?: GroupRole;
	joinedAt?: string;
}

export interface Group {
	id?: number;
	name?: string;
	inviteCode?: string;
	createdAt?: string;
	members?: GroupMember[];
}
