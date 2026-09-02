import {
  Users,
  BriefcaseBusiness,
  FileText,
  Building2,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
} from 'lucide-react'

const stats = [
  { title: 'Total Users', value: '1,248', change: '+12.5%', icon: Users },
  { title: 'Active Jobs', value: '356', change: '+8.2%', icon: BriefcaseBusiness },
  { title: 'Applications', value: '2,845', change: '+15.4%', icon: FileText },
  { title: 'Companies', value: '184', change: '+6.8%', icon: Building2 },
]

const recentJobs = [
  { title: 'Senior Frontend Engineer', company: 'HireStream Technologies', applications: 24, status: 'Approved' },
  { title: 'Product Marketing Manager', company: 'Ethio Digital', applications: 18, status: 'Pending' },
  { title: 'Customer Success Specialist', company: 'Tech Solutions', applications: 32, status: 'Approved' },
  { title: 'Backend Developer', company: 'Horizon Systems', applications: 15, status: 'Pending' },
]

export default function AdminOverviewPage() {
  return (
    <>
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                  <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Platform Overview</h3>
              <p className="text-sm text-slate-500">Activity across your platform</p>
            </div>
            <TrendingUp className="text-green-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <UserCheck className="text-blue-600 mb-2" size={22} />
              <p className="text-2xl font-bold">892</p>
              <p className="text-sm text-slate-500">Active users</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <Clock className="text-orange-500 mb-2" size={22} />
              <p className="text-2xl font-bold">42</p>
              <p className="text-sm text-slate-500">Pending reviews</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <CheckCircle className="text-green-600 mb-2" size={22} />
              <p className="text-2xl font-bold">756</p>
              <p className="text-sm text-slate-500">Jobs approved</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100">
              + Add New Job
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">
              Review Applications
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100">
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent Job Listings</h3>
            <p className="text-sm text-slate-500">Manage the latest jobs submitted to the platform</p>
          </div>
          <button className="text-sm text-blue-600 font-medium">View All</button>
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
              {recentJobs.map((job) => (
                <tr key={job.title} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{job.title}</td>
                  <td className="px-6 py-4 text-slate-500">{job.company}</td>
                  <td className="px-6 py-4">{job.applications}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {job.status}
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
    </>
  )
}
