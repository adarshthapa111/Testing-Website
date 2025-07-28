import { useEffect, useState } from "react"
import { TestCaseManager } from "@/testCases/index"
import { Sidebar } from "@/sidebar/index"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/themeToggle/themeProvider"
import { useSelector } from "react-redux"
import { selectFeatures } from "@/sidebar/reducer/sidebarSlice"
import { selectProjects, selectProjectLoading, fetchProject } from "@/project/reducer/projectSlice"
import { useAppDispatch } from "@/hooks/use-dispatch"
import { HomePage } from "./homePage.tsx"
import { ProjectsPage } from "@/project/ProjectsPage.tsx"
import { ProjectDetails } from "@/project/ProjectDetails.tsx"

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const features = useSelector(selectFeatures);
  const projects = useSelector(selectProjects);
  const projectsLoading = useSelector(selectProjectLoading);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'projects' | 'projectDetails' | 'testcases'>('home');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(()=>{
    if(!selectedFeature && features.length > 0 && currentView !== 'home' && currentView !== 'projects' && currentView !== 'projectDetails') {
      setSelectedFeature(features[0]._id)
    }
  }, [features, selectedFeature, currentView])

  const handleFeatureClick = (featureId: string | null) => {
    if (featureId) {
      setSelectedFeature(featureId);
      setCurrentView('testcases');
      // Store the current project ID when navigating to test cases
      if (currentView === 'projectDetails' && selectedProject) {
        setLastProjectId(selectedProject);
      }
    }
  }

  const handleHomeClick = () => {
    setSelectedFeature(null);
    setCurrentView('home');
  }

  const handleProjectsClick = () => {
    setSelectedFeature(null);
    setCurrentView('projects');
  }

  const handleProjectClick = (projectId: string) => {
    // Navigate to project details or features within project
    console.log('Project clicked:', projectId);
    // For now, we'll just show the test cases view
    setCurrentView('testcases');
  }

  const handleProjectDetailsClick = (projectId: string) => {
    console.log('Navigating to project details:', projectId);
    setSelectedProject(projectId);
    setCurrentView('projectDetails');
  }

  const handleBackFromProjectDetails = () => {
    setSelectedProject(null);
    setCurrentView('projects');
  }

  const handleBackToFeatures = () => {
    setSelectedFeature(null);
    // If we have a last project ID, go back to that project's features
    if (lastProjectId) {
      setSelectedProject(lastProjectId);
      setCurrentView('projectDetails');
    } else {
      // Fallback to projects page
      setCurrentView('projects');
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar
            onHomeClick={handleHomeClick}
            onProjectsClick={handleProjectsClick}
            currentView={currentView}
          />
          <div className="flex-1 flex flex-col min-w-0">
            {currentView === 'home' ? (
              <HomePage
                projects={projects}
                loading={projectsLoading}
                onProjectClick={handleProjectDetailsClick}
                onProjectsClick={handleProjectsClick}
              />
            ) : currentView === 'projects' ? (
              <ProjectsPage
                onProjectClick={handleProjectClick}
                onProjectDetailsClick={handleProjectDetailsClick}
              />
            ) : currentView === 'projectDetails' && selectedProject ? (
              <ProjectDetails
                projectId={selectedProject}
                onBack={handleBackFromProjectDetails}
                onFeatureClick={handleFeatureClick}
              />
            ) : selectedFeature && (
              <TestCaseManager
                features={features}
                selectedFeature={selectedFeature}
                onBackToFeatures={handleBackToFeatures}
              />
            )}
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
