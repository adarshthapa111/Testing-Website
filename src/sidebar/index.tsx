import { useEffect } from "react"
import {
  Home,
  Folder,
  FlaskConical,
  TrendingUp,
  Activity,
  Plus,
  Sparkles,
} from "lucide-react"
import { useAppDispatch } from "@/hooks/use-dispatch"
import {
  selectFeatures,
  fetchFeatures,
} from "./reducer/sidebarSlice"
import { selectTestCases } from "../testCases/reducer/testCaseSlice"
import { useSelector } from "react-redux"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  onHomeClick?: () => void
  onProjectsClick?: () => void
  currentView?: 'home' | 'projects' | 'projectDetails' | 'testcases'
}

export function Sidebar({ onHomeClick, onProjectsClick, currentView }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const features = useSelector(selectFeatures)
  const testCases = useSelector(selectTestCases)

  useEffect(() => {
    dispatch(fetchFeatures())
  }, [dispatch])

  // Calculate quick stats
  const totalProjects = features.length
  const totalTestCases = testCases.length
  const passedTests = testCases.filter((tc: any) => tc.status === "Pass").length
  const successRate = totalTestCases > 0 ? Math.round((passedTests / totalTestCases) * 100) : 0

  // Get recent features (last 3)
  const recentFeatures = features.slice(0, 3)

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
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
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
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentView === 'projects' || currentView === 'projectDetails'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 hover:shadow-sm'
            }`}
          >
            <Folder className="h-5 w-5" />
            <span>Projects</span>
          </button>
        </nav>

        {/* Quick Stats */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Stats
          </h3>
          
          <div className="space-y-3">
            {/* Projects */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-3 py-2.5 cursor-pointer hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Projects</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {totalProjects}
              </Badge>
            </div>

            {/* Test Cases */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 px-3 py-2.5 cursor-pointer hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Test Cases</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {totalTestCases}
              </Badge>
            </div>

            {/* Success Rate */}
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 px-3 py-2.5 cursor-pointer hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Success Rate</span>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                {successRate}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Features
          </h3>
          
          <div className="space-y-2">
            {recentFeatures.length === 0 ? (
              <div className="text-center py-4 cursor-pointer">
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">No features yet</p>
              </div>
            ) : (
              recentFeatures.map((feature) => (
                <div
                  key={feature._id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {feature.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h3>
          
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full justify-start h-8 text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white cursor-pointer"
              onClick={onProjectsClick}
            >
              <Plus className="h-3 w-3 mr-2" />
              New Project
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start h-8 text-xs cursor-pointer"
              onClick={onHomeClick}
            >
              <Activity className="h-3 w-3 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
