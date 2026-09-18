import { Outlet } from 'react-router-dom'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'

export default function EmployeeLayoutPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex">
        <EmployeeSidebar />
        <div className="flex-1 pt-14 md:pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
