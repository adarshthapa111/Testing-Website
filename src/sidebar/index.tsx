import {useEffect, useState} from "react";
import {Plus, Search, FileText, Trash2} from "lucide-react";
import {useSidebar} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import {useAppDispatch, useAppSelector} from "@/hooks/use-dispatch";
import {
  addFeature,
  selectFeatures,
  selectError,
  selectLoading,
  deleteFeature,
  setFeatures,
} from "./reducer/sidebarSlice";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SiderBarLoader } from "@/components/loader/sidebarLoader";
import { toast } from "sonner";
import { onValue, ref } from "firebase/database";
import { database } from "@/firebase";
import { useSelector } from "react-redux";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  testCounts: {
    passed: number;
    failed: number;
    ready: number;
  };
}

interface AppSidebarProps {
  selectedFeature: string | null;
  setSelectedFeature: (featureId: string | null) => void;
}

export function Sidebar({
  selectedFeature,
  setSelectedFeature,
}: AppSidebarProps) {
  const dispatch = useAppDispatch();
  const features = useSelector(selectFeatures);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {open} = useSidebar();

useEffect(() => {
  const featuresRef = ref(database, "features");

  const unsubscribe = onValue(featuresRef, (snapshot) => {
    const data = snapshot.val();
    const features = data
      ? Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          name: value.name,
          description: value.description,
          icon: value.icon || "📋",
          testCounts: value.testCounts || { passed: 0, failed: 0, ready: 0 },
        }))
      : [];

    dispatch(setFeatures(features));

  });
  return () => unsubscribe(); // clean up listener
}, [dispatch]);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Feature name is required")
      .min(3, "Feature name must be at least 3 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters"),
    icon: Yup.string()
      .required("Icon is required")
      .max(2, "Icon must be a single emoji"),
  });

  const initialValues = {
    name: "",
    description: "",
    icon: "📋",
    testCounts: {passed: 0, failed: 0, ready: 0},
  };

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId === selectedFeature ? null : featureId);
  };

  const handleAddFeature = async (
    values: Omit<Feature, "id">,
    {resetForm}: any
  ) => {
    try {
      console.log("ADDING FEATURE")
      await dispatch(addFeature(values)).unwrap();
      resetForm()
      setIsAddDialogOpen(false);
      toast.success("Feature added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add feature");
    }
  };

  const filteredFeatures = features.filter(
    (feature) =>
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteFeature = async(featureId:string, ) => {
    try{ 
      await dispatch(deleteFeature(featureId)).unwrap();
      toast.success("Feature deleted successfully 👍");
    }catch(error: any) {
       toast.error("Error deleting feature!", error);
    }
  }

  if (!open) return null;

  return (
    <div className="w-1/5 min-w-[300px] h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Test Manager
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Organize by features
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Add Feature Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gray-900 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium py-2.5 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Feature</DialogTitle>
              <DialogDescription>
                Create a new feature to organize your test cases.
              </DialogDescription>
            </DialogHeader>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleAddFeature}
            >
              {({isSubmitting}) => (
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
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-red-500 text-sm"
                    />
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
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="text-red-500 text-sm"
                    />
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
                    <ErrorMessage
                      name="icon"
                      component="p"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-gray-600 hover:bg-gray-700"
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading && 
          <SiderBarLoader/>
        }
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-3">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className={`group relative rounded-sm p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                selectedFeature === feature.id
                  ? "bg-gray-900 text-white border-2 border-gray-100 shadow-md shadow-gray-600"
                  : index === 0
                  ? "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                  : index === 3
                  ? "bg-gray-100 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700"
                  : "bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold text-sm leading-tight ${
                        selectedFeature === feature.id
                          ? "text-white"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {feature.name}
                    </h3>
                    {feature.testCounts.passed +
                      feature.testCounts.failed +
                      feature.testCounts.ready >
                      0 && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          selectedFeature === feature.id
                            ? "bg-gray-500 text-white"
                            : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        {feature.testCounts.passed +
                          feature.testCounts.failed +
                          feature.testCounts.ready}
                      </span>
                    )}
                     <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                                selectedFeature === feature.id
                                  ? "hover:bg-gray-700 text-white"
                                  : "hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{feature.name}"? This action cannot be undone and will
                                also delete all associated test cases.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFeature(feature.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                  </div>
                  <p
                    className={`text-xs mb-3 line-clamp-2 ${
                      selectedFeature === feature.id
                        ? "text-gray-100"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {feature.description}
                  </p>
                  {/* Status Indicators */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="items-center gap-1">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div
                            className={
                              selectedFeature === feature.id ? "text-gray-100" : "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {feature.testCounts.passed}
                            </div>
                      </div>
                        <div>
                         Passed
                      </div>
                    </div>
                   <div className="items-center gap-1">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div
                            className={
                              selectedFeature === feature.id ? "text-gray-100" : "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {feature.testCounts.failed}
                            </div>
                      </div>
                        <div>
                         Failed
                      </div>
                    </div>
                    <div className="items-center gap-1">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <div
                            className={
                              selectedFeature === feature.id ? "text-gray-100" : "text-gray-600 dark:text-gray-300"
                            }
                          >
                            {feature.testCounts.ready}
                            </div>
                      </div>
                        <div>
                         Ready
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

