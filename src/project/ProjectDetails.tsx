import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search,
  ArrowLeft,
  Target,
  Trash2,
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { useSelector } from "react-redux"
import { selectProjects } from "./reducer/projectSlice"
import { selectFeatures, selectLoading, addFeature, fetchFeatures, deleteFeature } from "@/sidebar/reducer/sidebarSlice"
import { type Project } from "./reducer/projectSlice"
import { type Feature } from "@/sidebar/reducer/sidebarSlice"
import { useAppDispatch } from "@/hooks/use-dispatch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { FeatureGridSkeleton } from "@/components/ui/featureSkeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

interface ProjectDetailsProps {
  projectId: string
  onBack: () => void
  onFeatureClick: (featureId: string) => void
}

const featureValidationSchema = Yup.object({
  name: Yup.string().required("Feature name is required").min(3, "Feature name must be at least 3 characters"),
  description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
  icon: Yup.string().required("Icon is required").max(2, "Icon must be a single emoji"),
})

const featureInitialValues = {
  name: "",
  description: "",
  icon: "🔧",
}

export function ProjectDetails({ projectId, onBack, onFeatureClick }: ProjectDetailsProps) {
  console.log('ProjectDetails rendered with projectId:', projectId);
  const dispatch = useAppDispatch()
  const projects: Project[] = useSelector(selectProjects)
  const features: Feature[] = useSelector(selectFeatures)
  const loading = useSelector(selectLoading)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateFeatureOpen, setIsCreateFeatureOpen] = useState(false)

  const project = projects.find(p => p._id === projectId)
  const projectFeatures = features.filter(f => f.projectId === projectId) // Assuming features have projectId
  const filteredFeatures = projectFeatures.filter(feature =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    dispatch(fetchFeatures())
  }, [dispatch])

  const handleCreateFeature = async (values: any, { resetForm }: any) => {
    try {
      await dispatch(addFeature({ ...values, projectId })).unwrap()
      toast.success("Feature created successfully!")
      resetForm()
      setIsCreateFeatureOpen(false)
      // Refetch features to get updated test counts
      dispatch(fetchFeatures())
    } catch (error: any) {
      toast.error(error.message || "Failed to create feature")
    }
  }

  const handleDeleteFeature = async (featureId: string) => {
    try {
      await dispatch(deleteFeature(featureId)).unwrap()
      toast.success("Feature deleted successfully!")
      // Refetch features to get updated test counts
      dispatch(fetchFeatures())
    } catch (error: any) {
      toast.error(error.message || "Failed to delete feature")
    }
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project not found</h2>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={onBack}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Projects</span>
                </button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsCreateFeatureOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Feature
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="w-full">
            
            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Features</p>
                      <p className="text-3xl font-bold">{projectFeatures.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/20">
                      <FlaskConical className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Test Cases</p>
                      <p className="text-3xl font-bold">
                        {projectFeatures.reduce((sum, f) => sum + f.testCounts.passed + f.testCounts.failed + f.testCounts.pending, 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/20">
                      <Target className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Success Rate</p>
                      <p className="text-3xl font-bold">
                        {(() => {
                          const total = projectFeatures.reduce((sum, f) => sum + f.testCounts.passed + f.testCounts.failed + f.testCounts.pending, 0)
                          const passed = projectFeatures.reduce((sum, f) => sum + f.testCounts.passed, 0)
                          return total > 0 ? Math.round((passed / total) * 100) : 0
                        })()}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/20">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Active Tests</p>
                      <p className="text-3xl font-bold">
                        {projectFeatures.reduce((sum, f) => sum + f.testCounts.pending, 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/20">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Features */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{filteredFeatures.length} of {projectFeatures.length} features</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            {loading ? (
              <FeatureGridSkeleton />
            ) : filteredFeatures.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <FlaskConical className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {searchQuery ? 'No features found' : 'No features yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? `No features match "${searchQuery}". Try a different search term.`
                    : "Create your first feature to start organizing your test cases."
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => setIsCreateFeatureOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Feature
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeatures.map((feature) => (
                  <Card 
                    key={feature._id}
                    className="group border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => onFeatureClick(feature._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Left Section - Feature Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <FlaskConical className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {feature.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {feature.description}
                            </p>
                          </div>
                        </div>

                        {/* Center Section - Test Stats */}
                        <div className="flex items-center gap-4 px-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-gray-500">{feature.testCounts.passed}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-gray-500">{feature.testCounts.failed}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">{feature.testCounts.pending}</span>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-1">
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
                                <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{feature.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFeature(feature._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Create Feature Dialog */}
      <Dialog open={isCreateFeatureOpen} onOpenChange={setIsCreateFeatureOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Create New Feature
            </DialogTitle>
            <DialogDescription>Create a new feature for this project.</DialogDescription>
          </DialogHeader>
          <Formik initialValues={featureInitialValues} validationSchema={featureValidationSchema} onSubmit={handleCreateFeature}>
            {({ isSubmitting }) => (
              <Form className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="feature-name">Feature Name</Label>
                  <Field
                    as={Input}
                    id="feature-name"
                    name="name"
                    placeholder="Enter feature name"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feature-description">Description</Label>
                  <Field
                    as={Textarea}
                    id="feature-description"
                    name="description"
                    placeholder="Enter feature description"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feature-icon">Icon (Emoji)</Label>
                  <Field
                    as={Input}
                    id="feature-icon"
                    name="icon"
                    placeholder="🔧"
                    maxLength={2}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="icon" component="p" className="text-red-500 text-sm" />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Feature"}
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  )
} 