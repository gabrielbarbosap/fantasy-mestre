export interface User {
  userId: string;
  name: string;
  /** Nickname único para exibição no app */
  nickname?: string;
  /** Versão normalizada para busca/validação de unicidade */
  nicknameLower?: string;
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
