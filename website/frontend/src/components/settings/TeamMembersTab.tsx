import { Users, Lock } from 'lucide-react';

export default function TeamMembersTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1">Team Members</h3>
        <p className="text-sm text-gray-500">Manage who has access to your workspace.</p>
      </div>

      {/* Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#7C3AED]" />
        <div>
          <p className="text-sm font-semibold text-[#1E1B4B]">Coming Soon</p>
          <p className="text-sm text-gray-600 mt-1">
            Team management will be available after backend auth upgrade. You will be able to
            invite members, assign roles, and control permissions from this tab.
          </p>
        </div>
      </div>

      {/* Placeholder Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F5F3FF]">
              <th className="px-4 py-3 text-left font-medium text-[#1E1B4B]">Name</th>
              <th className="px-4 py-3 text-left font-medium text-[#1E1B4B]">Email</th>
              <th className="px-4 py-3 text-left font-medium text-[#1E1B4B]">Role</th>
              <th className="px-4 py-3 text-left font-medium text-[#1E1B4B]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>Invite &amp; manage your team here once the feature is live.</span>
        </div>
      </div>
    </div>
  );
}
