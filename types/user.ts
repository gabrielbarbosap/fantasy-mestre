export interface User {
  userId: string;
  name: string;
  email: string;
  teamId: string;
  clubId?: string;
  photoURL?: string;
  totalPoints: number;
  createdAt: string;
  /** Premium pode criar ligas */
  isPremium?: boolean;
  /** ID da liga em que participa (apenas uma) */
  leagueId?: string;
}
