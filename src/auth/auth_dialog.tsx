import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"

interface AuthDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

type AuthMode = "login" | "signup"

// Validation schemas
const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

const signupSchema = Yup.object({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
})

export function AuthDialog({ isOpen, onOpenChange }: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Force form re-render

  const loginInitialValues = {
    email: "",
    password: "",
  }

  const signupInitialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  }

  // Reset all states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAuthMode("login")
      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsLoading(false)
      setFormKey((prev) => prev + 1) // Force form reset
    }
  }, [isOpen])

  const handleLogin = async (values: typeof loginInitialValues, { resetForm }: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful login
      console.log("Login attempt:", values)
      toast.success("Successfully logged in! 🎉")
      resetForm()
      onOpenChange(false)
    } catch (error) {
      toast.error("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (values: typeof signupInitialValues, { resetForm }: any) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful signup
      console.log("Signup attempt:", values)
      toast.success("Account created successfully! 🎉")
      resetForm()
      onOpenChange(false)
    } catch (error) {
      toast.error("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setAuthMode(authMode === "login" ? "signup" : "login")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setFormKey((prev) => prev + 1) // Force form reset when switching modes
  }

  const handleDialogChange = (open: boolean) => {
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {authMode === "login" ? (
              <>
                <LogIn className="h-5 w-5" />
                Welcome Back
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Create Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {authMode === "login" ? "Sign in to your account to continue" : "Create a new account to get started"}
          </DialogDescription>
        </DialogHeader>

        {authMode === "login" ? (
          <Formik
            key={`login-${formKey}`}
            initialValues={loginInitialValues}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4 py-4">
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Field
                    as={Input}
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading || isSubmitting}
                    className="border-gray-400"
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      disabled={isLoading || isSubmitting}
                      className="border-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
                </div>

                <DialogFooter className="flex flex-col gap-4 mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>

                </DialogFooter>
                  <div className="text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm font-medium text-black hover:text-gray-700 underline"
                      onClick={toggleAuthMode}
                      disabled={isLoading || isSubmitting}
                    >
                      Sign up
                    </Button>
                  </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            key={`signup-${formKey}`}
            initialValues={signupInitialValues}
            validationSchema={signupSchema}
            onSubmit={handleSignup}
          >
            {({ isSubmitting }) => (
              <Form className="grid gap-4 py-4">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Field
                    as={Input}
                    id="signup-name"
                    name="name"
                    placeholder="Enter your full name"
                    disabled={isLoading || isSubmitting}
                    className="border-gray-400"
                  />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Field
                    as={Input}
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading || isSubmitting}
                    className="border-gray-400"
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      disabled={isLoading || isSubmitting}
                      className="border-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isSubmitting}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      disabled={isLoading || isSubmitting}
                      className="border-gray-400 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading || isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm" />
                </div>

                <DialogFooter className="flex flex-col gap-4 mt-6">
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>

                </DialogFooter>
                <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm font-medium text-black hover:text-gray-700 underline"
                    onClick={toggleAuthMode}
                    disabled={isLoading || isSubmitting}
                >
                    Sign in
                </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>
  )
}
