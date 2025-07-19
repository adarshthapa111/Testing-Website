import { Button } from "@/components/ui/button";
import { Folder, Menu, Plus } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/themeToggle/index";

interface HeaderProps {
  selectedFeature: string | null;
  onAddTestCase: () => void;
  onCreateProject: () => void;
  getFeatureName: (featureId: string) => string;
}

export function Header({ selectedFeature, onAddTestCase, onCreateProject, getFeatureName }: HeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white dark:bg-gray-800 px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="-ml-1 border border-gray-400"
      >
        <Menu className="h-5 w-5 " />
      </Button>
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
            {selectedFeature ? getFeatureName(selectedFeature) : "Dashboard"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedFeature
              ? `Test cases for ${getFeatureName(selectedFeature)}`
              : "Main dashboard and overview screens"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant='outline' onClick={onCreateProject} >
            <Folder className="h-4 w-4 mr-2" />
            Create Project
          </Button>
          <ThemeToggle />
          <Button
            className="border-white border-2 shadow-md shadow-gray-600 bg-black hover:bg-gray-800 text-white"
            onClick={onAddTestCase}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Test Case
          </Button>
        </div>
      </div>
    </header>
  );
}