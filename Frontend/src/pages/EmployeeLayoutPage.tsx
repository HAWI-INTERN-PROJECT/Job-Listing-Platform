import { Outlet } from 'react-router-dom'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'

export default function EmployeeLayoutPage() {
	return (
		<div className="h-screen flex overflow-hidden bg-background">
			<EmployeeSidebar />

			<div className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 md:pt-0">
				<Outlet />
			</div>
		</div>
	)
}
