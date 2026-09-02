import { useState } from 'react'
import { Search, MoreVertical, Ban, CheckCircle } from 'lucide-react'

const mockUsers = [
  { id: 1, name: 'Abel Tesfaye', email: 'abel.t@example.com', role: 'Job Seeker', status: 'Active', joined: 'Jan 12, 2025' },
  { id: 2, name: 'HireStream Technologies', email: 'hr@hirestream.com', role: 'Employer', status: 'Active', joined: 'Feb 03, 2025' },
  { id: 3, name: 'Sara Mekonnen', email: 'sara.m@example.com', role: 'Job Seeker', status: 'Suspended', joined: 'Mar 22, 2025' },
  { id: 4, name: 'Ethio Digital', email: 'contact@ethiodigital.com', role: 'Employer', status: 'Active', joined: 'Apr 09, 2025' },
  { id: 5, name: 'Yonas Girma', email: 'yonas.g@example.com', role: 'Job Seeker', status: 'Active', joined: 'May 15, 2025' },
]

const filters = ['All', 'Job Seekers', 'Employers', 'Suspended'] as const

export default function AdminUsersPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')
  const [query, setQuery] = useState('')

  const filteredUsers = mockUsers.filter((u) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Job Seekers' && u.role === 'Job Seeker') ||
      (activeFilter === 'Employers' && u.role === 'Employer') ||
      (activeFilter === 'Suspended' && u.status === 'Suspended')
    const matchesQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="outline-none text-sm w-full"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4 text-slate-500">{u.email}</td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{u.joined}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {u.status === 'Active' ? (
                      <button className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <Ban size={14} /> Suspend
                      </button>
                    ) : (
                      <button className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <CheckCircle size={14} /> Reactivate
                      </button>
                    )}
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No users match this search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}