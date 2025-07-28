import { useState } from "react"
import { Folder } from "lucide-react"
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
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { addProject, type Project } from "./reducer/projectSlice"
import {useAppDispatch} from '@/hooks/use-dispatch';

interface CreateProjectDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  editingProject?: Project | null
}

const projectValidationSchema = Yup.object({
  name: Yup.string().required("Project name is required").min(3, "Project name must be at least 3 characters"),
  description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
  requirement: Yup.string().min(5, "Requirements must be at least 5 characters"),
  icon: Yup.string().required("Icon is required").max(2, "Icon must be a single emoji"),
})

const projectInitialValues = {
  _id: "",
  name: "",
  description: "",
  requirement: "",
  icon: "📁",
  createdAt: new Date().toISOString(),
}

export function CreateProjectDialog({ isOpen, onOpenChange, trigger, editingProject }: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch();

  const isEditing = !!editingProject
  const initialValues = editingProject ? {
    _id: editingProject._id,
    name: editingProject.name,
    description: editingProject.description,
    requirement: editingProject.requirement,
    icon: editingProject.icon,
    createdAt: editingProject.createdAt,
  } : projectInitialValues

  const handleCreateProject = async (values: Omit<Project, "_id" | "createdAt">, { resetForm }: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      console.log("BUtton clickd !!")
      // await new Promise((resolve) => setTimeout(resolve, 1500))
      await dispatch(addProject(values)).unwrap()
      toast.success("Project created successfully! 🎉")
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your project details.' : 'Create a new project to organize your features and test cases.'}
          </DialogDescription>
        </DialogHeader>
        <Formik initialValues={initialValues} validationSchema={projectValidationSchema} onSubmit={handleCreateProject}>
          {({ isSubmitting }) => (
            <Form className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Field
                  as={Input}
                  id="project-name"
                  name="name"
                  placeholder="Enter project name"
                  disabled={isLoading || isSubmitting}
                />
                <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Field
                  as={Textarea}
                  id="project-description"
                  name="description"
                  placeholder="Enter project description"
                  rows={3}
                  disabled={isLoading || isSubmitting}
                />
                <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-requirement">Requirements</Label>
                <Field
                  as={Textarea}
                  id="project-requirement"
                  name="requirement"
                  placeholder="Enter project requirements"
                  rows={2}
                  disabled={isLoading || isSubmitting}
                />
                <ErrorMessage name="requirement" component="p" className="text-red-500 text-sm" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-icon">Icon (Emoji)</Label>
                <Field
                  as={Input}
                  id="project-icon"
                  name="icon"
                  placeholder="📁"
                  maxLength={2}
                  disabled={isLoading || isSubmitting}
                />
                <ErrorMessage name="icon" component="p" className="text-red-500 text-sm" />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Project" : "Create Project")}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}