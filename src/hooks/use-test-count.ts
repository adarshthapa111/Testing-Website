import { useMemo } from "react"

interface TestCase {
  _id?: string
  test_case_id: string
  description: string
  priority: "High" | "Medium" | "Low"
  status: "Pass" | "Fail" | "Pending"
  featureId: string
}

interface Feature {
  _id: string
  name: string
  description: string
  icon: string
  testCounts: {
    passed: number
    failed: number
    pending: number
  }
}

interface TestCaseCounts {
  [featureId: string]: {
    passed: number
    failed: number
    pending: number
    total: number
  }
}

export function useTestCaseCounts(testCases: TestCase[]) {
  return useMemo(() => {
    const counts: TestCaseCounts = {}

    testCases.forEach((testCase) => {
      const featureId = testCase.featureId

      if (!counts[featureId]) {
        counts[featureId] = {
          passed: 0,
          failed: 0,
          pending: 0,
          total: 0,
        }
      }

      // Count by status
      switch (testCase.status.toLowerCase()) {
        case "pass":
          counts[featureId].passed++
          break
        case "fail":
          counts[featureId].failed++
          break
        case "pending":
          counts[featureId].pending++
          break
      }

      counts[featureId].total++
    })

    return counts
  }, [testCases])
}

export function useFeaturesWithCounts(features: Feature[], testCases: TestCase[]) {
  const testCaseCounts = useTestCaseCounts(testCases)

  return useMemo(() => {
    return features.map((feature) => ({
      ...feature,
      testCounts: {
        passed: testCaseCounts[feature._id]?.passed || 0,
        failed: testCaseCounts[feature._id]?.failed || 0,
        pending: testCaseCounts[feature._id]?.pending || 0,
      },
    }))
  }, [features, testCaseCounts])
}
