import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Filter, Download, Plus, ArrowLeft, FlaskConical } from "lucide-react";
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
import { addTestCase, deleteTestCase, fetchTestCases, selectTestCases, selectLoading, type TestCase } from "./reducer/testCaseSlice";
import { useSelector } from "react-redux";
import { type Feature } from "@/sidebar/reducer/sidebarSlice";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { TestCaseTableSkeleton } from "@/components/ui/tableLoader";

type Priority = "High" | "Medium" | "Low";
type Status = "Pass" | "Fail" | "Pending";

interface TestCaseManagerProps {
  features: Feature[];
  selectedFeature: string | null;
  onBackToFeatures?: () => void;
}

export function TestCaseManager({
  features,
  selectedFeature,
  onBackToFeatures,
}: TestCaseManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const testCases = useSelector(selectTestCases);
  const loading = useSelector(selectLoading);
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
    priority: Yup.string().required("Priority required!"),
    status: Yup.string().required("Status required!"),
  });

  const initialValues = {
    test_case_id: "",
    description: "",
    priority: "Medium" as Priority,
    status: "Pending" as Status,
    featureId: selectedFeature || "",
  };



  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setNewTestCase({
      test_case_id: testCase.test_case_id,
      description: testCase.description,
      priority: testCase.priority as Priority,
      status: testCase.status as Status,
      featureId: testCase.featureId,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (values: Omit<TestCase, 'loading' | 'error'>, { resetForm: resetFormikForm }: any) => {
    try {
      await dispatch(addTestCase(values)).unwrap();
      toast.success("Test case added successfully!");
      resetFormikForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to add test case");
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    try {
      await dispatch(deleteTestCase(testCaseId)).unwrap();
      toast.success("Test case deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete test case");
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredTestCases.map((testCase) => [
      testCase.test_case_id,
      testCase.description,
      testCase.status,
      testCase.priority,
    ]);

    autoTable(doc, {
      head: [["ID", "Description", "Status", "Priority"]],
      body: tableData,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    doc.save("test-cases.pdf");
    setIsExportDialogOpen(false);
    toast.success("PDF exported successfully!");
  };

  const getFeatureName = (featureId: string) => {
    const feature = features.find((f) => f._id === featureId);
    return feature ? feature.name : "Unknown Feature";
  };

  const filteredTestCases = testCases.filter((testCase) => {
    const matchesSearch = testCase.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      testCase.test_case_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || testCase.status === statusFilter;
    const matchesFeature = selectedFeature
      ? String(testCase.featureId) === String(selectedFeature)
      : true;
    return matchesSearch && matchesStatus && matchesFeature;
  });

  const selectedFeatureData = features.find(f => f._id === selectedFeature);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-6">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {selectedFeature && onBackToFeatures && (
                  <button
                    onClick={onBackToFeatures}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Features</span>
                  </button>
                )}
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Cases</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {selectedFeatureData 
                      ? `Managing test cases for ${selectedFeatureData.name}`
                      : "All test cases in the system"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Test Case
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
            
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search test cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
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
                  
                  <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
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
              </div>
            </div>

            {/* Test Cases Table */}
            {loading ? (
              <TestCaseTableSkeleton />
            ) : filteredTestCases.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <FlaskConical className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No test cases found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {selectedFeature
                    ? `No test cases in ${getFeatureName(selectedFeature)}`
                    : "No test cases in the system"}
                </p>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Case
                </Button>
              </div>
            ) : (
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <TableHead className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide">ID</TableHead>
                          <TableHead className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide">Description</TableHead>
                          <TableHead className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide">Status</TableHead>
                          <TableHead className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide">Priority</TableHead>
                          <TableHead className="font-bold text-sm text-gray-700 dark:text-gray-300 py-4 px-6 uppercase tracking-wide text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTestCases.map((testCase, index) => (
                          <TableRow
                            key={testCase.test_case_id}
                            className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-base border-b border-gray-100 dark:border-gray-800 ${
                              index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/30'
                            }`}
                          >
                            <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400 py-4 px-6 text-sm">
                              {testCase.test_case_id}
                            </TableCell>
                            <TableCell className="max-w-xs py-4 px-6 text-sm">
                              <div
                                className="line-clamp-3 break-words whitespace-normal text-gray-700 dark:text-gray-300 leading-relaxed"
                                title={testCase.description}
                              >
                                {testCase.description}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-sm">
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
                                className="font-semibold px-3 py-1.5 text-xs rounded-full"
                              >
                                {testCase.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-sm">
                              <Badge
                                className="font-semibold px-3 py-1.5 text-xs rounded-full"
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
                            <TableCell className="py-4 px-6 text-sm">
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
                                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200"
                                      onClick={() => handleEditTestCase(testCase)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Test Case</DialogTitle>
                                      <DialogDescription>Update the test case details.</DialogDescription>
                                    </DialogHeader>
                                    <Formik initialValues={newTestCase} validationSchema={validationSchema} onSubmit={handleSubmit}>
                                      {({ isSubmitting }) => (
                                        <Form className="grid gap-4 py-4">
                                          <div className="grid gap-2">
                                            <Label htmlFor="test_case_id">Test Case ID</Label>
                                            <Field
                                              as={Input}
                                              id="test_case_id"
                                              name="test_case_id"
                                              placeholder="TC_01"
                                              disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="test_case_id" component="p" className="text-red-500 text-sm" />
                                          </div>
                                          <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Field
                                              as={Textarea}
                                              id="description"
                                              name="description"
                                              placeholder="Enter test case description"
                                              rows={3}
                                              disabled={isSubmitting}
                                            />
                                            <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                              <Label htmlFor="priority">Priority</Label>
                                              <Field
                                                as="select"
                                                id="priority"
                                                name="priority"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={isSubmitting}
                                              >
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                              </Field>
                                              <ErrorMessage name="priority" component="p" className="text-red-500 text-sm" />
                                            </div>
                                            <div className="grid gap-2">
                                              <Label htmlFor="status">Status</Label>
                                              <Field
                                                as="select"
                                                id="status"
                                                name="status"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={isSubmitting}
                                              >
                                                <option value="Pass">Pass</option>
                                                <option value="Fail">Fail</option>
                                                <option value="Pending">Pending</option>
                                              </Field>
                                              <ErrorMessage name="status" component="p" className="text-red-500 text-sm" />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button
                                              type="submit"
                                              className="bg-blue-600 hover:bg-blue-700"
                                              disabled={isSubmitting}
                                            >
                                              {isSubmitting ? "Updating..." : "Update Test Case"}
                                            </Button>
                                          </DialogFooter>
                                        </Form>
                                      )}
                                    </Formik>
                                  </DialogContent>
                                </Dialog>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Test Case</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{testCase.test_case_id}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => testCase._id && handleDeleteTestCase(testCase._id)}
                                        className="bg-red-600 hover:bg-red-700"
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Test Case Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Test Case</DialogTitle>
            <DialogDescription>Create a new test case to track your testing progress.</DialogDescription>
          </DialogHeader>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting }) => (
              <Form className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="test_case_id">Test Case ID</Label>
                  <Field
                    as={Input}
                    id="test_case_id"
                    name="test_case_id"
                    placeholder="TC_01"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="test_case_id" component="p" className="text-red-500 text-sm" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Field
                    as={Textarea}
                    id="description"
                    name="description"
                    placeholder="Enter test case description"
                    rows={3}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Field
                      as="select"
                      id="priority"
                      name="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </Field>
                    <ErrorMessage name="priority" component="p" className="text-red-500 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="Pending">Pending</option>
                    </Field>
                    <ErrorMessage name="status" component="p" className="text-red-500 text-sm" />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Test Case"}
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