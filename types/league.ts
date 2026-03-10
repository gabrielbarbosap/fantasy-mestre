export interface League {
  leagueId: string;
  name: string;
  code: string;
  ownerId: string;
  memberIds: string[];
  pendingRequestIds: string[];
  createdAt: string;
}
