'use client';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-4">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
    </tr>
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-2/3"></div>
      <div className="h-2 bg-gray-200 rounded w-1/3 mt-2"></div>
    </div>
  );
}
