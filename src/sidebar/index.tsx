import { useEffect } from "react"
import {
  Home,
  Folder,
  FlaskConical,
  BarChart3,
  Settings,
  HelpCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react"
import { useAppDispatch } from "@/hooks/use-dispatch"
import {
  selectFeatures,
  fetchFeatures,
} from "./reducer/sidebarSlice"
import { selectTestCases } from "../testCases/reducer/testCaseSlice"
import { useSelector } from "react-redux"
import { Badge } from "@/components/ui/badge"

interface AppSidebarProps {
  onHomeClick?: () => void
  onProjectsClick?: () => void
  currentView?: 'home' | 'projects' | 'projectDetails' | 'testcases'
}

export function Sidebar({ onHomeClick, onProjectsClick, currentView }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const features = useSelector(selectFeatures)
  const testCases: any = useSelector(selectTestCases)

  useEffect(() => {
    dispatch(fetchFeatures())
  }, [dispatch])

  const overallStats = {
    totalProjects: features.length,
    totalTests: testCases.length,
    passedTests: testCases.filter((tc: any) => tc.status === "Pass").length,
    failedTests: testCases.filter((tc: any) => tc.status === "Fail").length,
    pendingTests: testCases.filter((tc: any) => tc.status === "Pending").length,
  }

  const successRate = overallStats.totalTests > 0 ? Math.round((overallStats.passedTests / overallStats.totalTests) * 100) : 0

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Test Manager</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Testing Platform</p>
          </div>
        </div>
      </div>



      {/* Navigation Menu */}
      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Navigation
          </h3>
          
          {/* Home */}
          <button
            onClick={onHomeClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              currentView === 'home'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          {/* Projects */}
          <button
            onClick={onProjectsClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              currentView === 'projects' || currentView === 'projectDetails'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm'
            }`}
          >
            <Folder className="h-5 w-5" />
            <span>Projects</span>
          </button>

          {/* Reports */}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Reports</span>
          </button>

          {/* Settings */}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>

          {/* Help */}
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

        {/* Quick Stats */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Stats
          </h3>
          
          {/* Projects Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Projects</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {overallStats.totalProjects}
              </Badge>
            </div>

            {/* Test Cases Stats */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Test Cases</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {overallStats.totalTests}
              </Badge>
            </div>

            {/* Success Rate */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Success Rate</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                {successRate}%
              </Badge>
            </div>
          </div>

          {/* Test Status Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400">Test Status</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-slate-600 dark:text-slate-400">Passed</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{overallStats.passedTests}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span className="text-slate-600 dark:text-slate-400">Pending</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{overallStats.pendingTests}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-slate-600 dark:text-slate-400">Failed</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{overallStats.failedTests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Activity className="h-3 w-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
