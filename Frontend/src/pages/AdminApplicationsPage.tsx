const applications = [
  { applicant: 'Abel Tesfaye', job: 'Senior Frontend Engineer', company: 'HireStream Technologies', status: 'Under Review' },
  { applicant: 'Sara Mekonnen', job: 'Product Marketing Manager', company: 'Ethio Digital', status: 'Shortlisted' },
  { applicant: 'Yonas Girma', job: 'Backend Developer', company: 'Horizon Systems', status: 'Rejected' },
]

export default function AdminApplicationsPage() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Applications</h3>
        <p className="text-sm text-slate-500">Track applications submitted across all job listings</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="px-6 py-4">Applicant</th>
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={`${a.applicant}-${a.job}`} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{a.applicant}</td>
                <td className="px-6 py-4 text-slate-500">{a.job}</td>
                <td className="px-6 py-4 text-slate-500">{a.company}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {a.status}
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