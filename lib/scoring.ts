import type { PlayerMatchStats } from "@/types/database";
import { SCORING_RULES } from "@/types/database";
import type { PlayerPosition } from "@/types/player";

const DEFENSIVE_POSITIONS: PlayerPosition[] = ["GK", "DEF"];

export function calculatePlayerPoints(
  stats: PlayerMatchStats,
  position: PlayerPosition
): number {
  let points = 0;

  points += stats.goals * SCORING_RULES.goal;
  points += stats.assists * SCORING_RULES.assist;
  points += stats.yellowCards * SCORING_RULES.yellowCard;
  points += stats.redCards * SCORING_RULES.redCard;
  points += stats.ownGoals * SCORING_RULES.ownGoal;
  points += stats.missedPenalties * SCORING_RULES.missedPenalty;

  if (stats.minutes >= 90) {
    points += SCORING_RULES.play90Minutes;
  }

  if (DEFENSIVE_POSITIONS.includes(position)) {
    points += stats.goalsConceded * SCORING_RULES.goalConceded;
    if (stats.goalsConceded === 0 && stats.minutes >= 60) {
      points += SCORING_RULES.cleanSheet;
    }
  }

  return points;
}
