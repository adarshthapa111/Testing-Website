import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Filter, Download, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
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
import { CreateProjectDialog } from "@/project/index";
import { Header } from "../topSection/index";
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"

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

  // Filter test cases for the selected feature:
  const featureTestCases = selectedFeature
    ? testCases.filter(tc => tc.featureId === selectedFeature)
    : [];
  const passed = featureTestCases.filter(tc => tc.status === "Pass").length;
  const pending = featureTestCases.filter(tc => tc.status === "Pending").length;
  const failed = featureTestCases.filter(tc => tc.status === "Fail").length;
  const total = featureTestCases.length;
  const percentPassed = total > 0 ? Math.round((passed / total) * 100) : 0;
  const percentPending = total > 0 ? Math.round((pending / total) * 100) : 0;
  const percentFailed = total > 0 ? Math.round((failed / total) * 100) : 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        selectedFeature={selectedFeature}
        onAddTestCase={() => setIsAddDialogOpen(true)}
        onCreateProject={() => setIsAuthDialogOpen(true)}
        getFeatureName={getFeatureName}
      />
      {/* Test Cases Overview as a separate card below the header */}
      <div className="px-6 pt-4">
        <TooltipProvider>
          <div className="mb-6 pt-8 pb-8 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                Test Cases Overview
              </h3>
            </div>
            {selectedFeature ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                  <div className="p-1 rounded bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-base font-bold text-green-600 dark:text-green-400">{passed}</span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">Passed</div>
                  </div>
                  <div className="p-1 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-base font-bold text-yellow-600 dark:text-yellow-400">{pending}</span>
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-0.5">Pending</div>
                  </div>
                  <div className="p-1 rounded bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-base font-bold text-red-600 dark:text-red-400">{failed}</span>
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">Failed</div>
                  </div>
                </div>
                <Progress value={percentPassed} className="h-1" />
                <div className="flex justify-between text-[11px] mt-1 text-gray-600 dark:text-gray-400">
                  <span>{percentPassed}% Passed</span>
                  <span>{percentPending}% Pending</span>
                  <span>{percentFailed}% Failed</span>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-gray-500 py-4">Select a feature to see test case overview.</div>
            )}
          </div>
        </TooltipProvider>
      </div>
      {/* Table and controls remain in their own card below */}
      <div className="flex-1 p-6 pt-0">
        <Card className="h-full overflow-y-auto">
          <CardContent className="p-6">
            {/* Enhanced Table Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pass">Pass</SelectItem>
                  <SelectItem value="Fail">Fail</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              {/* In the table controls row, replace the Export button with the AlertDialog logic: */}
              <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md">
                    <Download className="h-4 w-4 mr-1" />
                    Export
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
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <Table className="bg-white dark:bg-gray-900 text-base w-full min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="font-semibold text-lg text-gray-900 dark:text-white py-4 px-4">ID</TableHead>
                      <TableHead className="font-semibold text-lg text-gray-900 dark:text-white py-4 px-4">Description</TableHead>
                      <TableHead className="font-semibold text-lg text-gray-900 dark:text-white py-4 px-4">Status</TableHead>
                      <TableHead className="font-semibold text-lg text-gray-900 dark:text-white py-4 px-4">Priority</TableHead>
                      <TableHead className="font-semibold text-lg text-gray-900 dark:text-white py-4 px-4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestCases.map((testCase, index) => (
                      <TableRow
                        key={testCase.test_case_id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-base ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
                        }`}
                      >
                        <TableCell className="font-mono font-semibold text-blue-600 dark:text-blue-400 py-4 px-4 text-base">
                          {testCase.test_case_id}
                        </TableCell>
                        <TableCell className="max-w-xs py-4 px-4 text-base">
                          <div
                            className="line-clamp-3 break-words whitespace-normal text-gray-700 dark:text-gray-300 leading-relaxed"
                            title={testCase.description}
                          >
                            {testCase.description}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-base">
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
                            className="font-medium px-3 py-1 text-base"
                          >
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-base">
                          <Badge
                            className="font-medium px-3 py-1 text-base"
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
                        <TableCell className="py-4 px-4 text-base">
                          <div className="flex items-center justify-center gap-2">
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
                                  className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={() => handleEditTestCase(testCase)}
                                >
                                  <Edit className="h-5 w-5" />
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
                                      <SelectTrigger className="w-full">
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
                                        <SelectTrigger className="w-full">
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
                                        <SelectTrigger className="w-full">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-5 w-5" />
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

                <div className="grid gap-2 w-full">
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
                        <SelectTrigger className="w-full">
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
                    < Field name="priority">
                      {({ field, form }: any) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => form.setFieldValue("priority", value)}
                          disabled={loading === true || isSubmitting}
                        >
                          <SelectTrigger className="w-full">
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
                          onValueChange={(value) => form.setFieldValue("status", value)}
                          disabled={loading === true || isSubmitting}
                        >
                          <SelectTrigger className="w-full">
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
      <CreateProjectDialog isOpen={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}