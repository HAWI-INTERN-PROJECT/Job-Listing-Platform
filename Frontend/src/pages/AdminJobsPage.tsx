const jobs = [
  { title: 'Senior Frontend Engineer', company: 'HireStream Technologies', applications: 24, status: 'Approved' },
  { title: 'Product Marketing Manager', company: 'Ethio Digital', applications: 18, status: 'Pending' },
  { title: 'Customer Success Specialist', company: 'Tech Solutions', applications: 32, status: 'Approved' },
  { title: 'Backend Developer', company: 'Horizon Systems', applications: 15, status: 'Pending' },
]

export default function AdminJobsPage() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Job Management</h3>
        <p className="text-sm text-slate-500">Approve, edit, or remove job listings submitted by employers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="px-6 py-4">Job</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Applications</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.title} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{job.title}</td>
                <td className="px-6 py-4 text-slate-500">{job.company}</td>
                <td className="px-6 py-4">{job.applications}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 text-sm font-medium">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}