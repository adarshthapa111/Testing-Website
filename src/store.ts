import { configureStore } from '@reduxjs/toolkit'
import createReducer from '@/testCases/reducer/testCaseSlice';
import featureReducer from '@/sidebar/reducer/sidebarSlice';
import projectReducer from '@/project/reducer/projectSlice';

export const store = configureStore({
  reducer: {
    testcases: createReducer,
    feature: featureReducer,
    project: projectReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch