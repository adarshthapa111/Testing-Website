import { configureStore } from '@reduxjs/toolkit'
import createReducer from '@/testCases/reducer/testCaseSlice';
import featureReducer from '@/sidebar/reducer/sidebarSlice';
export const store = configureStore({
  reducer: {
    testcases: createReducer,
    feature: featureReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch