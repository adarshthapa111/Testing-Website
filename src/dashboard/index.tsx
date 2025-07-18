import { useEffect, useState } from "react"
import { TestCaseManager } from "@/testCases/index"
import { Sidebar } from "@/sidebar/index"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/themeToggle/themeProvider"
import { useSelector } from "react-redux"
import { selectFeatures } from "@/sidebar/reducer/sidebarSlice"

export default function Dashboard() {
  const features = useSelector(selectFeatures);
const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  useEffect(()=>{
    if(!selectedFeature && features.length > 0) {
      setSelectedFeature(features[0]._id)
    }
  }, [features, selectedFeature])


  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
          />
          <div className="flex-1 flex flex-col min-w-0">
            {selectedFeature && (
              <TestCaseManager
                features={features}
                selectedFeature={selectedFeature}
              />
            )}
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
