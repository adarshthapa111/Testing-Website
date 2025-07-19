import { useEffect, useState } from "react"
import {
  Plus,
  Search,
  Trash2,
  PenBoxIcon,
  Edit,
  MoreVertical,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAppDispatch, useAppSelector } from "@/hooks/use-dispatch"
import {
  addFeature,
  selectFeatures,
  selectError,
  selectLoading,
  deleteFeature,
  fetchFeatures,
} from "./reducer/sidebarSlice"
import { selectTestCases } from "../testCases/reducer/testCaseSlice" // Import your test cases selector
import { SiderBarLoader } from "@/components/loader/sidebarLoader"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useFeaturesWithCounts } from "../hooks/use-test-count"


interface Feature {
  _id: string
  name: string
  description: string
  icon: string
  testCounts: {
    passed: number
    failed: number
    pending: number
  }
}

interface AppSidebarProps {
  selectedFeature: string | null
  setSelectedFeature: (featureId: string | null) => void
}

export function Sidebar({ selectedFeature, setSelectedFeature }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const features = useSelector(selectFeatures)
  const testCases: any = useSelector(selectTestCases) // Get test cases from Redux
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)

  // Use the custom hook to get features with calculated counts
  const featuresWithCounts = useFeaturesWithCounts(features, testCases)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { open } = useSidebar()

  useEffect(() => {
    dispatch(fetchFeatures())
  }, [dispatch])

  const validationSchema = Yup.object({
    name: Yup.string().required("Feature name is required").min(3, "Feature name must be at least 3 characters"),
    description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
    icon: Yup.string().required("Icon is required").max(2, "Icon must be a single emoji"),
  })

  const initialValues = {
    _id: "",
    name: "",
    description: "",
    icon: "📋",
    testCounts: { passed: 0, failed: 0, pending: 0 },
  }

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId)
  }

  const handleAddFeature = async (values: Omit<Feature, "id">, { resetForm }: any) => {
    try {
      await dispatch(addFeature(values)).unwrap()
      resetForm()
      setIsAddDialogOpen(false)
      dispatch(fetchFeatures())
      toast.success("Feature added successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to add feature")
    }
  }

  const handleEditFeature = async () => {
    try {
      // You'll need to implement updateFeature action in your slice
      // await dispatch(updateFeature(values)).unwrap();
      // resetForm()
      setIsEditDialogOpen(false)
      setEditingFeature(null)
      dispatch(fetchFeatures())
      toast.success("Feature updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update feature")
    }
  }

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature)
    setIsEditDialogOpen(true)
  }

  const filteredFeatures = featuresWithCounts.filter(
    (feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteFeature = async (featureId: string) => {
    try {
      await dispatch(deleteFeature(featureId)).unwrap()
      toast.success("Feature deleted successfully 👍")
    } catch (error: any) {
      toast.error("Error deleting feature!", error)
    }
  }

  // Calculate overall statistics
  const overallStats = featuresWithCounts.reduce(
    (acc, feature) => ({
      totalFeatures: acc.totalFeatures + 1,
      totalTests: acc.totalTests + feature.testCounts.passed + feature.testCounts.failed + feature.testCounts.pending,
      totalPassed: acc.totalPassed + feature.testCounts.passed,
      totalFailed: acc.totalFailed + feature.testCounts.failed,
      totalPending: acc.totalPending + feature.testCounts.pending,
    }),
    { totalFeatures: 0, totalTests: 0, totalPassed: 0, totalFailed: 0, totalPending: 0 },
  )

  if (!open) return null

  return (
    <div className="shadow-md w-80 h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-700 dark:to-slate-500 text-white shadow-lg">
            <PenBoxIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Test Manager</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {overallStats.totalFeatures} features • {overallStats.totalTests} tests
            </p>
          </div>
        </div>

        {/* Overall Statistics */}
        {overallStats.totalTests > 0 && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{overallStats.totalPassed}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Passed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">{overallStats.totalPending}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Pending</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{overallStats.totalFailed}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 shadow-sm"
          />
        </div>

        {/* Add Feature Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="border-white border-2 shadow-md shadow-gray-600 w-full bg-gradient-to-r from-slate-900 to-slate-700  text-white font-medium py-3 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Feature</DialogTitle>
              <DialogDescription>Create a new feature to organize your test cases.</DialogDescription>
            </DialogHeader>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleAddFeature}>
              {({ isSubmitting }) => (
                <Form className="grid gap-4 py-4">
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="grid gap-2">
                    <Label htmlFor="name">Feature Name</Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      placeholder="Enter feature name"
                      disabled={loading || isSubmitting}
                    />
                    <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Field
                      as={Textarea}
                      id="description"
                      name="description"
                      placeholder="Enter feature description"
                      rows={3}
                      disabled={loading || isSubmitting}
                    />
                    <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Field
                      as={Input}
                      id="icon"
                      name="icon"
                      placeholder="📋"
                      maxLength={2}
                      disabled={loading || isSubmitting}
                    />
                    <ErrorMessage name="icon" component="p" className="text-red-500 text-sm" />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-slate-600 hover:bg-slate-700"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? "Adding..." : "Add Feature"}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* Edit Feature Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Feature</DialogTitle>
              <DialogDescription>Update the feature details.</DialogDescription>
            </DialogHeader>
            {editingFeature && (
              <Formik initialValues={editingFeature} validationSchema={validationSchema} onSubmit={handleEditFeature}>
                {({ isSubmitting }) => (
                  <Form className="grid gap-4 py-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Feature Name</Label>
                      <Field
                        as={Input}
                        id="edit-name"
                        name="name"
                        placeholder="Enter feature name"
                        disabled={loading || isSubmitting}
                      />
                      <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Field
                        as={Textarea}
                        id="edit-description"
                        name="description"
                        placeholder="Enter feature description"
                        rows={3}
                        disabled={loading || isSubmitting}
                      />
                      <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-icon">Icon (Emoji)</Label>
                      <Field
                        as={Input}
                        id="edit-icon"
                        name="icon"
                        placeholder="📋"
                        maxLength={2}
                        disabled={loading || isSubmitting}
                      />
                      <ErrorMessage name="icon" component="p" className="text-red-500 text-sm" />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-slate-600 hover:bg-slate-700"
                        disabled={loading || isSubmitting}
                      >
                        {loading || isSubmitting ? "Updating..." : "Update Feature"}
                      </Button>
                    </DialogFooter>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loading && <SiderBarLoader />}
        {error && <p className="text-red-500 text-center p-4">{error}</p>}

        {filteredFeatures.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No features found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {searchQuery ? "Try adjusting your search terms" : "Create your first feature to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeatures.map((feature) => {
              const totalTests = feature.testCounts.passed + feature.testCounts.failed + feature.testCounts.pending
              const isSelected = selectedFeature === feature._id

              return (
                <Card
                  key={feature._id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isSelected
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-white border-2 shadow-md shadow-gray-600"
                      : "bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={() => handleFeatureClick(feature._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{feature.icon}</div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-sm uppercase tracking-wide ${
                              isSelected ? "text-white" : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {feature.name}
                          </h3>
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${
                              isSelected ? "text-slate-200" : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {totalTests > 0 && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              isSelected
                                ? "bg-slate-700 text-slate-200"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {totalTests}
                          </Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 opacity-100 transition-opacity ${
                                isSelected
                                  ? "hover:bg-slate-700 text-slate-200 hover:text-gray-100"
                                  : "hover:bg-slate-600 dark:hover:bg-slate-700 hover:text-gray-100"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(feature)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Feature
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteFeature(feature._id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Feature
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {totalTests > 0 && (
                      <>

                        {/* Test Statistics */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div
                              className={`flex items-center justify-center gap-1 mb-1 ${
                                isSelected ? "text-green-300" : "text-green-600"
                              }`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-sm font-bold">{feature.testCounts.passed}</span>
                            </div>
                            <div
                              className={`text-xs ${
                                isSelected ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              Passed
                            </div>
                          </div>

                          <div className="text-center">
                            <div
                              className={`flex items-center justify-center gap-1 mb-1 ${
                                isSelected ? "text-yellow-300" : "text-yellow-600"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span className="text-sm font-bold">{feature.testCounts.pending}</span>
                            </div>
                            <div
                              className={`text-xs ${
                                isSelected ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              Pending
                            </div>
                          </div>

                          <div className="text-center">
                            <div
                              className={`flex items-center justify-center gap-1 mb-1 ${
                                isSelected ? "text-red-500" : "text-red-600"
                              }`}
                            >
                              <XCircle className="h-3 w-3" />
                              <span className="text-sm font-bold">{feature.testCounts.failed}</span>
                            </div>
                            <div
                              className={`text-xs ${
                                isSelected ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              Failed
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {totalTests === 0 && (
                      <div className="text-center py-4">
                        <TrendingUp
                          className={`h-8 w-8 mx-auto mb-2 ${
                            isSelected ? "text-slate-400" : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                        <p
                          className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}
                        >
                          No test cases yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
