export default function AdminSettingsPage() {
  return (
    <div className="bg-white rounded-xl border p-6 max-w-xl">
      <h3 className="text-lg font-semibold mb-1">Settings</h3>
      <p className="text-sm text-slate-500 mb-6">Platform-wide configuration for the admin portal</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Platform name</label>
          <input
            type="text"
            defaultValue="Lidiya Job Seeker"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Support email</label>
          <input
            type="email"
            placeholder="support@example.com"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
          Save changes
        </button>
      </div>
    </div>
  )
}