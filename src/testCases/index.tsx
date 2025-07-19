import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Filter, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { addTestCase, deleteTestCase, editTestCase, fetchTestCases, resetForm, selectError, selectLoading, selectTestCases, type TestCase } from "./reducer/testCaseSlice";
import { useSelector } from "react-redux";
import { type Feature } from "@/sidebar/reducer/sidebarSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { AuthDialog } from "@/auth/auth_dialog";
import { Header } from "../topSection/index";

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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const testCases = useSelector(selectTestCases);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isEditDialogueOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    test_case_id: "",
    description: "",
    priority: "Medium" as Priority,
    status: "Pending" as Status,
    featureId: "",
  });
  const dispatch = useAppDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Fetch DATA
  useEffect(() => {
    dispatch(fetchTestCases());
  }, [dispatch, selectedFeature]);

  // SUBMIT FORM FOR ADDING TEST CASE
  const validationSchema = Yup.object({
    test_case_id: Yup.string()
      .required("Test id required!")
      .matches(/^TC_\d+$/, 'ID must start with "TC_" followed by numbers (e.g., TC_01)'),
    description: Yup.string()
      .required("Description required!")
      .min(10, "Description must be at least 10 characters!"),
    featureId: Yup.string().required("Feature required!"),
    priority: Yup.string()
      .required("Priority is required!")
      .oneOf(["High", "Medium", "Low"], "Invalid priority"),
    status: Yup.string().required("Status required!"),
  });

  const initialValues = {
    test_case_id: "TC_01",
    description: "",
    featureId: selectedFeature ? String(selectedFeature) : "",
    priority: "Medium",
    status: "Pending",
  };

  const handleUpdateTestCase = async (testCaseId: string) => {
    try {
      await dispatch(
        editTestCase({
          id: testCaseId,
          data: {
            test_case_id: newTestCase.test_case_id,
            description: newTestCase.description,
            priority: newTestCase.priority,
            status: newTestCase.status,
            featureId: newTestCase.featureId,
          },
        })
      ).unwrap();
      setEditingTestCase(null);
      setIsEditDialogOpen(false);
      dispatch(fetchTestCases());
      toast.success("Test case updated successfully 👍");
    } catch (error) {
      console.error("Failed to update test case:", error);
    }
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setIsEditDialogOpen(true);
    setNewTestCase({
      test_case_id: testCase.test_case_id,
      description: testCase.description,
      priority: testCase.priority as Priority,
      status: testCase.status as Status,
      featureId: testCase.featureId,
    });
  };

  const handleSubmit = async (values: Omit<TestCase, 'loading' | 'error'>, { resetForm: resetFormikForm }: any) => {
    try {
      await dispatch(addTestCase({
        test_case_id: values.test_case_id,
        description: values.description,
        featureId: values.featureId,
        priority: values.priority,
        status: values.status,
      })).unwrap();
      dispatch(resetForm());
      resetFormikForm();
      setIsAddDialogOpen(false);
      dispatch(fetchTestCases());
      toast.success("Successfully added test case ✅");
    } catch (error: any) {
      toast.error(`Error adding test case ${error?.message}`);
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    try {
      console.log(testCaseId);
      dispatch(deleteTestCase(testCaseId)).unwrap();
      toast.success("Successfully deleted test case ✅");
    } catch (error: any) {
      toast.error("Error deleting test case", error);
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    const featureName = selectedFeature ? getFeatureName(selectedFeature) : '';
    const featureNameUpperCase = featureName.toUpperCase();
    doc.text(`TEST CASES FOR ${featureNameUpperCase}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["ID", "Description", "Priority", "Status"]],
      body: filteredTestCases.map((tc) => [
        tc.test_case_id,
        tc.description,
        tc.priority,
        tc.status,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [40, 40, 40],
      },
    });

    doc.save("test_cases.pdf");
    setIsExportDialogOpen(false);
  };

  const getFeatureName = (featureId: string) => {
    const feature = features.find((f) => f._id === featureId);
    return feature ? feature.name : "Unknown Feature";
  };

  const filteredTestCases = testCases.filter((testCase) => {
    const matchesSearch =
      testCase.test_case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || testCase.status === statusFilter;
    const matchesFeature = selectedFeature
      ? String(testCase.featureId) === String(selectedFeature)
      : true;
    return matchesSearch && matchesStatus && matchesFeature;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        selectedFeature={selectedFeature}
        onAddTestCase={() => setIsAddDialogOpen(true)}
        onCreateProject={() => setIsAuthDialogOpen(true)}
        getFeatureName={getFeatureName}
      />
      <div className="flex-1 p-6">
        <Card className="h-full overflow-y-auto">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 border border-gray-300"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 py-6 cursor-pointer border border-gray-400">
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
                <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <AlertDialogTrigger asChild className="py-6">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export to PDF
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to download the test cases as a PDF?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleExportToPDF}>
                        Yes, Download
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

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
                  className="border-white border-2 shadow-md shadow-gray-600 bg-black hover:bg-gray-800 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Case
                </Button>
              </div>
            ) : (
              <div className="md:max-h-[65vh] xl:max-h- overflow-y-auto">
                <Table className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestCases.map((testCase) => (
                      <TableRow key={testCase.test_case_id}>
                        <TableCell className="font-semibold">
                          {testCase.test_case_id}
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
                                ? "destructive"
                                : testCase.status === "Pass"
                                ? "success"
                                : testCase.status === "Pending"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="p-1"
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
                              open={isEditDialogueOpen && editingTestCase?._id === testCase._id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingTestCase(null);
                                  setIsEditDialogOpen(false);
                                }
                              }}
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
                                      value={newTestCase.test_case_id}
                                      onChange={(e) =>
                                        setNewTestCase({
                                          ...newTestCase,
                                          test_case_id: e.target.value,
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
                                            key={featureId._id}
                                            value={featureId._id}
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
                                    onClick={() => {
                                      if (testCase._id) {
                                        handleUpdateTestCase(testCase._id);
                                      }
                                    }}
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
                                    onClick={() => {
                                      if (testCase._id) {
                                        handleDeleteTestCase(testCase._id);
                                      }
                                    }}
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
            {({ isSubmitting }) => (
              <Form className="grid gap-4 py-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid gap-2">
                  <Label htmlFor="id">Test Case ID</Label>
                  <Field
                    as={Input}
                    id="test_case_id"
                    name="test_case_id"
                    placeholder="e.g., TC001"
                    disabled={loading === true || isSubmitting}
                  />
                  <ErrorMessage
                    name="id"
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

                <div className="grid gap-2">
                  <Label htmlFor="feature">Feature</Label>
                  <Field name="featureId">
                    {({ field, form }: any) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          form.setFieldValue("featureId", value)
                        }
                        disabled={loading === true || isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {features.map((feature) => (
                            <SelectItem key={feature._id} value={feature._id}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Field name="priority">
                      {({ field, form }: any) => (
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

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Field name="status">
                      {({ field, form }: any) => (
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
      <AuthDialog isOpen={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}