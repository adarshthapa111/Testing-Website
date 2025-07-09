import {useEffect, useState} from "react";
import {Edit, Trash2, Plus, Search, Filter, Download, Menu} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {useSidebar} from "@/components/ui/sidebar";
import {ThemeToggle} from "@/themeToggle/index";
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { addTestCase, deleteTestCase, editTestCase, fetchTestCases, resetForm, selectError, selectLoading, selectTestCases, type TestCase } from "./reducer/testCaseSlice";
import { useSelector } from "react-redux";
import { type Feature } from "@/sidebar/reducer/sidebarSlice";
import { toast } from "sonner";
type Priority = "High" | "Medium" | "Low";
type Status = "Pass" | "Fail" | "Pending";

interface TestCaseManagerProps {
  features: Feature[];
  selectedFeature: string | null;
}

export function TestCaseManager({
  features,
  selectedFeature,
}: TestCaseManagerProps) {
  console.log('ALL FEATURES::::', features)
  console.log("SELECTED TEST ID", selectedFeature);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const testCases = useSelector(selectTestCases);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [newTestCase, setNewTestCase] = useState({
    id: "",
    description: "",
    priority: "Medium" as Priority,
    status: "Pending" as Status,
    featureId: "",
    firebaseId: ""
  });
  const dispatch = useAppDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const {toggleSidebar} = useSidebar();

  //Fetcch DATA
  useEffect(()=>{
    dispatch(fetchTestCases(selectedFeature));
  }, [dispatch, selectedFeature])


  //SUBMIT FORM FOR ADDING TEST CASE
  const validationSchema = Yup.object({
    id: Yup.string()
      .required("Test id required!")
      .matches(
        /^TC\d+$/,
        'ID must start with "TC" followed by numbers (e.g., TC001)'
      ),
    description: Yup.string()
      .required("Description required!")
      .min(10, "Description must be atleast 10 character!"),
    feature: Yup.string().required("Feature required!"),
    priority: Yup.string()
      .required("Priority is reuqired!")
      .oneOf(["High", "Medium", "Low"], "Invalid priority"),
    status: Yup.string().required("Status required!"),
  });

  const initialValues = {
    id: "",
    description: "",
    featureId: "",
    priority: "",
    status: "",
    firebaseId: ""
  };

const handleUpdateTestCase = async(testCaseId: string) => {
  try {
    await dispatch(
      editTestCase({
        firebaseId: testCaseId,
        data: {
          id: newTestCase.id,
          description: newTestCase.description,
          priority: newTestCase.priority,
          status: newTestCase.status,
          featureId: newTestCase.featureId,
        },
      })
    ).unwrap();
    setEditingTestCase(null);
  } catch (error) {
    console.error("Failed to update test case:", error);
  }
  };

const handleEditTestCase = (testCase: TestCase) => {
  setEditingTestCase(testCase);
    setNewTestCase({
      id: testCase.id,
      description: testCase.description,
      priority: testCase.priority as Priority,
      status: testCase.status as Status,
      featureId: testCase.featureId,
      firebaseId: testCase.firebaseId,
    });
}

  const handleSubmit = async(values: Omit<TestCase, 'loading' | 'error'>, {resetForm: resetFormikForm}: any) =>{
    try{
      console.log("SUBMTTING")
      await dispatch(addTestCase(values)).unwrap();
      dispatch(resetForm());
      resetFormikForm();
      setIsAddDialogOpen(false);
      toast.success("Sucessfully added test case ✅")
    }catch(error: any) {  
      toast.error("Error adding test case", error);
    }
  }


  const handleDeleteTestCase = async(testCaseId: string) => {
    try{
      dispatch(deleteTestCase(testCaseId)).unwrap();
      toast.success("Sucessfully deleted test case ✅")
    }catch(error: any) {
      toast.error("Error deleting test case", error);
    }
  };

  const getFeatureName = (featureId: string) => {
    const feature = features.find((f) => f.id === featureId);
    return feature ? feature.name : "Unknown Feature";
  };

  const filteredTestCases = testCases.filter((testCase) => {
    const matchesSearch =
      testCase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || testCase.status === statusFilter;
    const matchesFeature = selectedFeature ? testCase.featureId === selectedFeature : true;
    return matchesSearch && matchesStatus && matchesFeature;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white dark:bg-gray-800 px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="-ml-1"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedFeature ? getFeatureName(selectedFeature) : "Dashboard"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFeature
                ? `Test cases for ${getFeatureName(selectedFeature)}`
                : "Main dashboard and overview screens"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-black hover:bg-gray-800 text-white"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Test Case
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Card className="h-full">
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Status: All</SelectItem>
                    <SelectItem value="Pass">Pass</SelectItem>
                    <SelectItem value="Fail">Fail</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Table or Empty State */}
            {filteredTestCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No test cases found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedFeature
                    ? `No test cases in ${getFeatureName(selectedFeature)}`
                    : "No test cases in Dashboard"}
                </p>
                <Button
                  className="bg-black hover:bg-gray-800 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Case
                </Button>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      {/* <TableHead>Last Modified ↑</TableHead> */}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-mono font-medium">
                          {testCase.id}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div
                            className="line-clamp-3 break-words whitespace-normal"
                            title={testCase.description}
                          >
                            {testCase.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              testCase.status === "Fail"
                                ? "destructive" // Red for Fail
                                : testCase.status === "Pass"
                                ? "success" // Green for Pass
                                : testCase.status === "Pending"
                                ? "warning" // Yellow for Pending
                                : "secondary" // Fallback
                            }
                          >
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              testCase.priority === "High"
                                ? "destructive"
                                : testCase.priority === "Medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog
                              open={editingTestCase?.id === testCase.id}
                              onOpenChange={(open) =>
                                !open && setEditingTestCase(null)
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTestCase(testCase)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Test Case</DialogTitle>
                                  <DialogDescription>
                                    Update the test case details.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-test-id">
                                      Test Case ID
                                    </Label>
                                    <Input
                                      id="edit-test-id"
                                      value={newTestCase.id}
                                      onChange={(e) =>
                                        setNewTestCase({
                                          ...newTestCase,
                                          id: e.target.value,
                                        })
                                      }
                                      placeholder="e.g., TC001"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-description">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="edit-description"
                                      value={newTestCase.description}
                                      onChange={(e) =>
                                        setNewTestCase({
                                          ...newTestCase,
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Describe the test case"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-feature">
                                      Feature
                                    </Label>
                                    <Select
                                      value={newTestCase.featureId}
                                      onValueChange={(value) =>
                                        setNewTestCase({
                                          ...newTestCase,
                                          featureId: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a feature" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {features.map((featureId) => (
                                          <SelectItem
                                            key={featureId.id}
                                            value={featureId.id}
                                          >
                                            {featureId.icon} {featureId.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-priority">
                                        Priority
                                      </Label>
                                      <Select
                                        value={newTestCase.priority}
                                        onValueChange={(value: Priority) =>
                                          setNewTestCase({
                                            ...newTestCase,
                                            priority: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="High">
                                            High
                                          </SelectItem>
                                          <SelectItem value="Medium">
                                            Medium
                                          </SelectItem>
                                          <SelectItem value="Low">
                                            Low
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-status">
                                        Status
                                      </Label>
                                      <Select
                                        value={newTestCase.status}
                                        onValueChange={(value: Status) =>
                                          setNewTestCase({
                                            ...newTestCase,
                                            status: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="Pass">
                                            Pass
                                          </SelectItem>
                                          <SelectItem value="Fail">
                                            Fail
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={()=>handleUpdateTestCase(testCase.firebaseId)}
                                  >
                                    Update Test Case
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the test case.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteTestCase(testCase.firebaseId)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Test Case Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Test Case</DialogTitle>
            <DialogDescription>
              Add a new test case for manual testing.
            </DialogDescription>
          </DialogHeader>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({isSubmitting}) => (
              <Form className="grid gap-4 py-4">
                {/* Global Error Message */}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Test Case ID */}
                <div className="grid gap-2">
                  <Label htmlFor="id">Test Case ID</Label>
                  <Field
                    as={Input}
                    id="id"
                    name="id"
                    placeholder="e.g., TC001"
                    disabled={loading === true || isSubmitting}
                  />
                  <ErrorMessage
                    name="id"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Field
                    as={Textarea}
                    id="description"
                    name="description"
                    placeholder="Describe the test case"
                    rows={3}
                    disabled={loading === true || isSubmitting}
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Feature */}
                <div className="grid gap-2">
                  <Label htmlFor="feature">Feature</Label>
                  <Field name="feature">
                    {({field, form}: any) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          form.setFieldValue("feature", value)
                        }
                        disabled={loading === true|| isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {features.map((feature) => (
                            <SelectItem key={feature.id} value={feature.id}>
                              {feature.icon} {feature.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="featureId"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Priority and Status */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Field name="priority">
                      {({field, form}: any) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            form.setFieldValue("priority", value)
                          }
                          disabled={loading === true || isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="priority"
                      component="p"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Field name="status">
                      {({field, form}: any) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            form.setFieldValue("status", value)
                          }
                          disabled={loading === true || isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Pass">Pass</SelectItem>
                            <SelectItem value="Fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="p"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-black cursor-pointer hover:bg-gray-800 text-white"
                    disabled={loading === true || isSubmitting}
                  >
                    {loading === true || isSubmitting
                      ? "Creating..."
                      : "Create Test Case"}
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </div>
  );
}
