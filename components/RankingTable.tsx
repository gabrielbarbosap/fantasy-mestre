"use client";

import Image from "next/image";
import type { LeaderboardEntry } from "@/types/database";

interface RankingTableProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
}

export function RankingTable({ entries, loading }: RankingTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-blue-600">Carregando ranking...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-blue-600">
        Nenhum jogador no ranking ainda.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-blue-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-blue-200 bg-blue-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
              #
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
              Nome
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
              Time
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-blue-900">
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
              <td className="px-6 py-4">
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
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
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
                  <span className="font-medium text-blue-900">{entry.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-blue-700">{entry.teamName}</td>
              <td className="px-6 py-4 text-right font-semibold text-blue-900">
                {entry.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
