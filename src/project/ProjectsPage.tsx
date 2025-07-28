import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Folder, 
  Search,
  Calendar,
  Edit,
  Trash2,
  Target
} from "lucide-react"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { selectProjects, fetchProject, deleteProject } from "./reducer/projectSlice"
import { type Project } from "./reducer/projectSlice"
import { CreateProjectDialog } from "./index.tsx"
import { useAppDispatch } from "@/hooks/use-dispatch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface ProjectsPageProps {
  onProjectClick?: (projectId: string) => void
  onProjectDetailsClick?: (projectId: string) => void
}

export function ProjectsPage({ onProjectDetailsClick }: ProjectsPageProps) {
  const dispatch = useAppDispatch()
  const projects: Project[] = useSelector(selectProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    dispatch(fetchProject())
  }, [dispatch])

  const handleDeleteProject = async (projectId: string) => {
    try {
      await dispatch(deleteProject(projectId)).unwrap()
      toast.success("Project deleted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project")
    }
  }

  // Filter projects based on search query
  const filteredProjects = projects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Sticky Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage and organize your testing projects
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Search and Stats */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{filteredProjects.length} of {projects.length} projects</span>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <Folder className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? `No projects match "${searchQuery}". Try a different search term.`
                    : "Create your first project to start organizing your test cases and features."
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => setIsCreateProjectOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <Card 
                    key={project._id}
                    className="group border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => onProjectDetailsClick?.(project._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Project Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {project.description}
                            </p>
                          </div>
                        </div>

                        {/* Right Section - Actions and Date */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onProjectDetailsClick?.(project._id)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="View Details"
                            >
                              <Target className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingProject(project)
                              }}
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{project.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProject(project._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Project Dialog */}
      <CreateProjectDialog 
        isOpen={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
      />
      
      {/* Edit Project Dialog */}
      {editingProject && (
        <CreateProjectDialog 
          isOpen={!!editingProject}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null)
          }}
          editingProject={editingProject}
        />
      )}
    </div>
  )
} 