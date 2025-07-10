import type { RootState } from './../../store';
import { database } from "@/firebase";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { push, ref, remove, update } from "firebase/database";

export interface TestCase {
  id: string;
  description: string;
  featureId: string;
  priority: string;
  status: string;
  firebaseId: string;
  loading?: boolean;
  error?: string;
}


export interface TestCaseState{
    testCase: TestCase[];
    loading: boolean;
    error: string;
}

const initialState: TestCaseState  = {
    testCase: [],
    loading: false,
    error: ''   

}

export const addTestCase = createAsyncThunk(
    'create/addTestCase', 
    async(testCase: any, {rejectWithValue}) => {
        try{
            const newTestCaseRef = ref(database, `testCases`);
            await push(newTestCaseRef, testCase)
        }catch(error: any){
            return rejectWithValue(error.message || 'Failed to add test case!')
        }
    }
)


//Editing test case 
export const editTestCase = createAsyncThunk(
  'testCase/editTestCases',
  async( updatedTestCase: {
      firebaseId: string;
      data: {
        id: string;
        description: string;
        priority: string;
        status: string;
        featureId: string;
      };
    }
    , {rejectWithValue})=> {
    try{
      const testCaseRef = ref(database, `testCases/${updatedTestCase.firebaseId}`);
      await update(testCaseRef, updatedTestCase.data);
      return {
        ...updatedTestCase.data, firebaseId: updatedTestCase.firebaseId
      }
    }catch(error: any) {
      return rejectWithValue(error.message || "Failed to edit test case!")
    }
  } 
)

export const deleteTestCase = createAsyncThunk (
  "testCases/deleteTestCases",
  async(testCaseId: string, {rejectWithValue}) => {
    try {
      const testCaseRef = ref(database, `testCases/${testCaseId}`);
      console.log("TestCaseID", testCaseId);
      await remove(testCaseRef);
      return testCaseId;
    }catch(error: any) {
      return rejectWithValue(error.message || "Error deleting test case!");
    }
  }
)

export const createTestSlice = createSlice({
    name: 'create',
    initialState,
    reducers: {
            resetForm: ()=> initialState,
            setTestCases: (state, action) => {
              state.testCase = action.payload;
            }
    },
    extraReducers: (builders) => {
        builders
        .addCase(addTestCase.fulfilled, (state)=>{
            state.loading = false;
            state.error = '';
        })
        .addCase(addTestCase.pending, (state)=>{
            state.loading = true;
            state.error = '';
        })
        .addCase(addTestCase.rejected, (state, action)=>{
            state.error = action.payload as string;
            state.loading = false;
        })
        .addCase(deleteTestCase.fulfilled, (state, action)=>{
          state.testCase = state.testCase.filter((testCase)=> testCase.id !== action.payload);
        })
    }
})

export default createTestSlice.reducer;

export const {resetForm, setTestCases} = createTestSlice.actions;

export const selectLoading = (state: RootState) => state.create.loading;
export const selectError = (state: RootState) => state.create.error;
export const selectTestCases = (state: RootState) => state.create.testCase;