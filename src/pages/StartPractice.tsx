import React, { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCompanyValidation } from "@/hooks/useCompanyValidation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  testType: z.enum(["mcq", "written", "video"], {
    required_error: "Please select a test type",
  }),
  difficulty: z.enum(["easy", "intermediate", "hard"]).optional(),
  numberOfQuestions: z.enum(["10", "15", "20"]).optional(),
})

const StartPractice = () => {
  const navigate = useNavigate()
  const { validateCompany, clearValidation, isValidating, validationError, companyData } = useCompanyValidation()
  const { toast } = useToast()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      difficulty: "intermediate",
      numberOfQuestions: "15",
    },
  })

  // Watch form values for progressive reveal
  const testType = useWatch({ control: form.control, name: "testType" })
  const companyName = useWatch({ control: form.control, name: "companyName" })
  const jobTitle = useWatch({ control: form.control, name: "jobTitle" })
  const difficulty = useWatch({ control: form.control, name: "difficulty" })
  const numberOfQuestions = useWatch({ control: form.control, name: "numberOfQuestions" })

  // Progressive reveal states with automatic progression
  const showInputs = !!testType
  const isCompanyValid = companyName && companyName.length >= 2 && companyData && !validationError
  const isJobTitleValid = jobTitle && jobTitle.length >= 2
  const showSelectors = showInputs && isCompanyValid && isJobTitleValid
  const showStartButton = showSelectors && difficulty && numberOfQuestions

  // Update step based on progress
  useEffect(() => {
    if (showStartButton) {
      setCurrentStep(3)
    } else if (showSelectors) {
      setCurrentStep(2)
    } else if (showInputs) {
      setCurrentStep(1)
    }
  }, [showInputs, showSelectors, showStartButton])

  useEffect(() => {
    return () => {
      clearValidation();
    };
  }, []);

  // Check if user is already on waitlist
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('video_interview_waitlist')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!error && data) {
        setIsOnWaitlist(true);
      }
    };
    
    checkWaitlistStatus();
  }, [user]);

  const handleWaitlistCheckbox = async (checked: boolean) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to join the waitlist.",
      });
      return;
    }

    setWaitlistLoading(true);

    try {
      if (checked) {
        // Add to waitlist
        const { error } = await supabase
          .from('video_interview_waitlist')
          .insert({
            user_id: user.id,
            email: user.email || '',
          });

        if (error) {
          // Check if user is already on waitlist
          if (error.code === '23505') {
            setIsOnWaitlist(true);
            toast({
              title: "Already on waitlist",
              description: "You're already signed up for updates!",
            });
          } else {
            throw error;
          }
        } else {
          setIsOnWaitlist(true);
          toast({
            title: "Success!",
            description: "You've been added to the waitlist. We'll notify you when this feature is ready!",
          });
        }
      } else {
        // Remove from waitlist
        const { error } = await supabase
          .from('video_interview_waitlist')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;

        setIsOnWaitlist(false);
        toast({
          title: "Removed from waitlist",
          description: "You've been removed from the waitlist.",
        });
      }
    } catch (error) {
      console.error('Waitlist error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update waitlist status. Please try again.",
      });
    } finally {
      setWaitlistLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Check if user is authenticated
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    const isValid = await validateCompany(values.companyName)
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError || "Please enter a valid company name",
      })
      return
    }

    // Send test details to webhook
    const webhookPayload = {
      user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company: companyData?.name || values.companyName,
      job_title: values.jobTitle,
      difficulty: values.difficulty?.charAt(0).toUpperCase() + values.difficulty?.slice(1),
      num_questions: parseInt(values.numberOfQuestions || "15"),
    }

    // Validate payload before sending
    if (!webhookPayload.company || !webhookPayload.job_title || !webhookPayload.difficulty) {
      console.error("Invalid payload - missing required fields:", webhookPayload)
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please ensure all required fields are filled out.",
      })
      return
    }

    console.log("Sending webhook payload:", webhookPayload)

    // Navigate immediately to waiting screen
    navigate("/waiting", {
      state: {
        testType: values.testType === "mcq" ? "MCQ Test" : "AI Video Interview",
        companyName: companyData?.name || values.companyName,
        jobTitle: values.jobTitle,
        companyLogo: companyData?.logo,
        difficulty: values.difficulty,
        numberOfQuestions: values.numberOfQuestions,
        userId: user.id,
      }
    })

    // Fire webhook asynchronously (don't block navigation)
    fetch("https://n8n-production-3583.up.railway.app/webhook/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })
      .then(async (response) => {
        console.log("Webhook response status:", response.status)
        if (!response.ok) {
          console.error(`Webhook failed with status ${response.status}`)
        } else {
          console.log("Webhook request successful!")
        }
      })
      .catch((error) => {
        console.error("Webhook error:", error)
      })
  }

  const handleCompanyBlur = async () => {
    const companyName = form.getValues("companyName");
    if (companyName && companyName.length >= 2) {
      await validateCompany(companyName);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4"
        onClick={() => navigate('/')}
        title="Back to Home"
      >
        <Home className="h-6 w-6" />
      </Button>

      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Start Your Interview Practice</h1>
        <p className="text-center text-gray-400 mb-8">Fill in the details below to customize your interview experience</p>
        
        {/* Progress Indicator */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm transition-colors duration-300 ${
                currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Test Type
              </span>
            </div>
            <div className={`h-0.5 w-12 transition-colors duration-300 ${
              currentStep >= 2 ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm transition-colors duration-300 ${
                currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Details
              </span>
            </div>
            <div className={`h-0.5 w-12 transition-colors duration-300 ${
              currentStep >= 3 ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep >= 3 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`ml-2 text-sm transition-colors duration-300 ${
                currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                Ready
              </span>
            </div>
          </div>
        </div>
        
        <div className="max-w-xl mx-auto glass-card p-8 rounded-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Test Type Selection - Always Visible */}
              <FormField
                control={form.control}
                name="testType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Test Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mcq" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Take MCQ Test
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="written" disabled />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-500">
                            Take Full Written Test (Coming Soon)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="video" disabled />
                          </FormControl>
                          <FormLabel className="font-normal text-gray-500">
                            Humanize AI Recruiter Video Call (Coming Soon)
                          </FormLabel>
                        </FormItem>
                        <div className="ml-8 mt-2 flex items-center space-x-2">
                          <Checkbox 
                            id="waitlist" 
                            checked={isOnWaitlist}
                            onCheckedChange={handleWaitlistCheckbox}
                            disabled={waitlistLoading}
                          />
                          <label
                            htmlFor="waitlist"
                            className="text-sm font-normal text-gray-400 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Yes! Send me insider tips & success stories
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Name and Job Title - Revealed after test type selection */}
              {showInputs && (
                <div className={`transition-all duration-400 space-y-6 ${showSelectors ? 'transform -translate-y-2 opacity-75' : 'opacity-100'}`}>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter company name" 
                              {...field}
                              onBlur={handleCompanyBlur}
                              onChange={(e) => {
                                field.onChange(e);
                                if (companyData) {
                                  clearValidation();
                                }
                                // Auto-validate company name as user types
                                const value = e.target.value;
                                if (value && value.length >= 2) {
                                  setTimeout(() => validateCompany(value), 500);
                                }
                              }}
                              className={`transition-all duration-300 ${
                                isCompanyValid ? 'ring-2 ring-green-500/30 bg-green-500/5' : ''
                              }`}
                            />
                            {isCompanyValid && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-fade-in">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        {isValidating && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Validating company...
                          </div>
                        )}
                        {validationError && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{validationError}</AlertDescription>
                          </Alert>
                        )}
                        {companyData && (
                          <div className="flex items-center gap-2 mt-2 bg-green-900/20 p-2 rounded-md border border-green-700/30">
                            {companyData.logo && (
                              <img src={companyData.logo} alt={companyData.name} className="h-6 w-6" />
                            )}
                            <span className="text-sm text-green-500">Verified: {companyData.name}</span>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter job title" 
                              {...field}
                              className={`transition-all duration-300 ${
                                isJobTitleValid ? 'ring-2 ring-green-500/30 bg-green-500/5' : ''
                              }`}
                            />
                            {isJobTitleValid && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-fade-in">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Difficulty and Number of Questions - Revealed after inputs are filled */}
              {showSelectors && (
                <div className="animate-fade-in transition-all duration-400 space-y-6 transform translate-y-0">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Difficulty Level</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="justify-start"
                          >
                            <ToggleGroupItem 
                              value="easy" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              Easy
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="intermediate" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              Intermediate
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="hard" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              Hard
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="justify-start"
                          >
                            <ToggleGroupItem 
                              value="10" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              10
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="15" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              15
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                              value="20" 
                              variant="outline"
                              className="px-6 py-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              20
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Motivational Text and Start Test Button */}
              {showStartButton && (
                <div className="animate-fade-in transition-all duration-400 space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">
                      Great choice! Let's tailor your <span className="text-primary font-semibold">{jobTitle}</span> interview at{' '}
                      <span className="text-primary font-semibold">{companyData?.name || companyName}</span>.
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Start Test'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>

      {/* Authentication Required Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to create an account or sign in to take the test. This allows us to save your results and track your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/auth')}>
              Sign In / Create Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StartPractice;
