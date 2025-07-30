
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProjectGridSkeleton } from "@/components/ui/project-skeleton"
import { StatsGridSkeleton } from "@/components/ui/stats-skeleton"
import { 
  Plus,
  Folder, 
  FlaskConical, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  Zap,
  Bell,
  ArrowRight,
  Target,
  Award,
  User
} from "lucide-react"
import { useSelector } from "react-redux"
import { selectTestCases } from "@/testCases/reducer/testCaseSlice"
import { type Project } from "@/project/reducer/projectSlice"

interface HomePageProps {
  projects: Project[]
  loading?: boolean
  onProjectClick: (projectId: string) => void
  onProjectsClick?: () => void
}

export function HomePage({ projects, loading = false, onProjectClick, onProjectsClick }: HomePageProps) {
  const testCases = useSelector(selectTestCases)

  // Calculate overall statistics
  const totalProjects = projects.length
  const totalTestCases = testCases.length
  const passedTests = testCases.filter(tc => tc.status === "Pass").length
  const failedTests = testCases.filter(tc => tc.status === "Fail").length
  const pendingTests = testCases.filter(tc => tc.status === "Pending").length
  const passRate = totalTestCases > 0 ? Math.round((passedTests / totalTestCases) * 100) : 0

  // Get recent projects (last 6)
  const recentProjects = projects.slice(0, 6)

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-6">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Welcome back! Here's an overview of your testing projects.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-2">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" className="border-2">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="w-full">
            
            {/* Overview Stats */}
            {loading ? (
              <StatsGridSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Projects</p>
                        <p className="text-3xl font-bold">{totalProjects}</p>
                        <p className="text-blue-200 text-xs mt-1">Active projects</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/20">
                        <Folder className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Test Cases</p>
                        <p className="text-3xl font-bold">{totalTestCases}</p>
                        <p className="text-green-200 text-xs mt-1">Total executed</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/20">
                        <FlaskConical className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                        <p className="text-3xl font-bold">{passRate}%</p>
                        <p className="text-purple-200 text-xs mt-1">Tests passed</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/20">
                        <Award className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Active Tests</p>
                        <p className="text-3xl font-bold">{pendingTests}</p>
                        <p className="text-orange-200 text-xs mt-1">In progress</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/20">
                        <Target className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Projects Section */}
              <div className="xl:col-span-2">
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Folder className="h-5 w-5 text-blue-600" />
                      Your Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <ProjectGridSkeleton />
                    ) : recentProjects.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                          <Folder className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first project to get started</p>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Project
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentProjects.map((project) => (
                          <div 
                            key={project._id}
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20"
                            onClick={() => onProjectClick(project._id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  <Folder className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {project.description}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                  Active
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                Created {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Stats */}
              <div className="xl:col-span-1">
                <div className="space-y-6 sticky top-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 text-left group hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={onProjectsClick}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">View Projects</p>
                          <p className="text-xs text-gray-500">Browse all projects</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-green-50 dark:hover:bg-green-900/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                          <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Generate Reports</p>
                          <p className="text-xs text-gray-500">Create reports</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-purple-50 dark:hover:bg-purple-900/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Team Settings</p>
                          <p className="text-xs text-gray-500">Manage team</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="w-full justify-start h-12 text-left group hover:bg-orange-50 dark:hover:bg-orange-900/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Schedule Tests</p>
                          <p className="text-xs text-gray-500">Plan execution</p>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Test Performance */}
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Test Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Passed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">{passedTests}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            {totalTestCases > 0 ? Math.round((passedTests / totalTestCases) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-yellow-600">{pendingTests}</span>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                            {totalTestCases > 0 ? Math.round((pendingTests / totalTestCases) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Failed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-red-600">{failedTests}</span>
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                            {totalTestCases > 0 ? Math.round((failedTests / totalTestCases) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Overall Progress</span>
                        <span>{passRate}%</span>
                      </div>
                      <Progress value={passRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                      <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Test case TC_001 passed</p>
                      <p className="text-sm text-gray-500">User authentication feature • 2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">New test case created</p>
                      <p className="text-sm text-gray-500">Payment processing feature • 15 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-800">
                      <Folder className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">New project created</p>
                      <p className="text-sm text-gray-500">Mobile app testing • 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 