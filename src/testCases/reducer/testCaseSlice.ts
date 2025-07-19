import { BASE_URL } from '@/utils/constants';
import type { RootState } from './../../store';
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

export interface TestCase {
  _id?: string;
  test_case_id: string;
  description: string;
  featureId: string;
  priority: string;
  status: string;
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
  async (
    testCase: Omit<TestCase, 'loading' | 'error'>,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${BASE_URL}/testcases`, {
        test_case_id: testCase.test_case_id,
        description: testCase.description,
        featureId: testCase.featureId,
        priority: testCase.priority,
        status: testCase.status,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add test case!');
    }
  }
);

export const fetchTestCases = createAsyncThunk('testCases/fetchTestCases', async(_, {rejectWithValue})=>{
  try{
    const response = await axios.get(`${BASE_URL}/testcases`);
    return response.data;
  }catch(error: any){
    return rejectWithValue(error.message || 'Failed to fetch data');
  }
})


//Editing test case 
export const editTestCase = createAsyncThunk(
  'testCase/editTestCases',
  async( updatedTestCase: {
      id: string;
      data: {
        test_case_id: string;
        description: string;
        priority: string;
        status: string;
        featureId: string;
      };
    }
    , {rejectWithValue})=> {
    try{
      const response = await axios.put(`${BASE_URL}/testcases/${updatedTestCase.id}`, updatedTestCase.data);
      return response.data;
    }catch(error: any) {
      return rejectWithValue(error.message || "Failed to edit test case!")
    }
  } 
)

export const deleteTestCase = createAsyncThunk (
  "testCases/deleteTestCases",
  async(testCaseId: string, {rejectWithValue}) => {
    try {
      await axios.delete(`${BASE_URL}/testcases/${testCaseId}`);
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
        .addCase(addTestCase.fulfilled, (state, action)=>{
            state.testCase.push(action.payload);
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
          state.testCase = state.testCase.filter((testCase)=> testCase._id !== action.payload);
        })
        .addCase(fetchTestCases.rejected, (state, action)=>{
          state.error = action.payload as string;
          state.loading = false;
        })
        .addCase(fetchTestCases.fulfilled, (state, action) => {
          state.testCase = action.payload;
          state.loading = false;
        })
        .addCase(fetchTestCases.pending, (state)=> {
          state.loading = true;
        })
    }
})

export default createTestSlice.reducer;

export const {resetForm, setTestCases} = createTestSlice.actions;
export const selectLoading = (state: RootState) => state.testcases.loading;
export const selectError = (state: RootState) => state.testcases.error;
export const selectTestCases = (state: RootState) => state.testcases.testCase;