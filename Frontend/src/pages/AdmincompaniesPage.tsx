const companies = [
  { name: 'HireStream Technologies', jobsPosted: 12, status: 'Verified' },
  { name: 'Ethio Digital', jobsPosted: 6, status: 'Verified' },
  { name: 'Tech Solutions', jobsPosted: 9, status: 'Pending Verification' },
  { name: 'Horizon Systems', jobsPosted: 3, status: 'Verified' },
]

export default function AdminCompaniesPage() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Companies</h3>
        <p className="text-sm text-slate-500">Employers registered on the platform</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Jobs Posted</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.name} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">{c.jobsPosted}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      c.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 text-sm font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}