
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { useCompanyValidation } from "@/hooks/useCompanyValidation"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  testType: z.enum(["mcq", "written", "video"], {
    required_error: "Please select a test type",
  }),
})

const StartPractice = () => {
  const navigate = useNavigate()
  const { validateCompany, clearValidation, isValidating, validationError, companyData } = useCompanyValidation()
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testType: "mcq",
    },
  })

  // Clear validation when form is reset
  useEffect(() => {
    return () => {
      clearValidation();
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isValid = await validateCompany(values.companyName)
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validationError || "Please enter a valid company name",
      })
      return
    }

    if (values.testType === "mcq") {
      navigate("/mcq-test", { 
        state: { 
          companyName: companyData?.name || values.companyName, 
          jobTitle: values.jobTitle,
          companyLogo: companyData?.logo,
        } 
      })
    } else {
      navigate("/coming-soon")
    }
  }

  // Function to validate company on blur
  const handleBlur = async () => {
    const companyName = form.getValues("companyName");
    if (companyName && companyName.length >= 2) {
      await validateCompany(companyName);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Start Your Interview Practice</h1>
        
        <div className="max-w-xl mx-auto glass-card p-8 rounded-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          onBlur={handleBlur}
                          onChange={(e) => {
                            field.onChange(e);
                            if (companyData) {
                              clearValidation();
                            }
                          }}
                        />
                        {companyData && !isValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                            Humanize AI Recruiter Video Call Test (Coming Soon)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Start Test'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default StartPractice;
