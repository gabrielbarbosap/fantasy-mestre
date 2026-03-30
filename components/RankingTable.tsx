"use client";

import Image from "next/image";
import type { LeaderboardEntry } from "@/types/database";
import { RankingTableShimmer } from "@/components/Shimmer";

interface RankingTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

export function RankingTable({ entries, loading }: RankingTableProps) {
  if (loading) {
    return <RankingTableShimmer />;
  }

  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-blue-600">
        Nenhum jogador no ranking ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-200">
      <table className="w-full min-w-[320px]">
        <thead>
          <tr className="border-b border-blue-200 bg-blue-50">
            <th className="px-3 py-3 text-left text-sm font-semibold text-blue-900 sm:px-6 sm:py-4">#</th>
            <th className="px-3 py-3 text-left text-sm font-semibold text-blue-900 sm:px-6 sm:py-4">Nome</th>
            <th className="hidden px-3 py-3 text-left text-sm font-semibold text-blue-900 sm:table-cell sm:px-6 sm:py-4">Time</th>
            <th className="px-3 py-3 text-right text-sm font-semibold text-blue-900 sm:px-6 sm:py-4">
              Pontuação geral
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.userId}
              className="border-b border-blue-100 last:border-0 hover:bg-blue-50"
            >
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-800"
                      : index === 1
                        ? "bg-blue-200 text-blue-800"
                        : index === 2
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {index + 1}
                </span>
              </td>
              <td className="px-3 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-blue-200 bg-blue-50">
                    {entry.photoURL ? (
                      <Image
                        src={entry.photoURL}
                        alt={entry.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-blue-600">
                        {entry.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <span className="max-w-[120px] truncate font-medium text-blue-900 sm:max-w-none">{entry.name}</span>
                </div>
              </td>
              <td className="hidden px-3 py-3 text-blue-700 sm:table-cell sm:px-6 sm:py-4">{entry.teamName}</td>
              <td className="px-3 py-3 text-right font-semibold text-blue-900 sm:px-6 sm:py-4">
                {entry.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
