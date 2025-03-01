
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, AlertTriangle, CheckCircle, Send, CreditCard, FileQuestion, MessageSquareWarning, Bug } from "lucide-react";

const Help = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorType, setErrorType] = useState("transaction");
  const [transactionId, setTransactionId] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
      toast.error("Please provide a description of the issue");
      return;
    }
    
    if (errorType === "transaction" && !transactionId) {
      toast.error("Please provide the transaction ID");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the error report into a table
      const { error } = await supabase
        .from("error_reports")
        .insert({
          user_id: user?.id,
          error_type: errorType,
          transaction_id: errorType === "transaction" ? transactionId : null,
          description,
          contact_email: email,
          status: "pending"
        });
      
      if (error) throw error;
      
      toast.success("Your report has been submitted successfully");
      setDescription("");
      setTransactionId("");
      setErrorType("transaction");
      
    } catch (error: any) {
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const faqs = [
    {
      question: "How do I purchase Spark Points?",
      answer: "You can purchase Spark Points from the Subscription page. We accept UPI payments. After making a payment, you'll need to enter the transaction ID to verify your purchase."
    },
    {
      question: "What if my transaction fails?",
      answer: "If your transaction fails, please report it through our help page. Provide the transaction ID and we'll investigate and resolve the issue within 24-48 hours."
    },
    {
      question: "How do I upload a project?",
      answer: "Go to the Upload page, fill in the required details, and attach your file. Each upload costs 5 Spark Points. You can also use our embedded form for more complex submissions."
    },
    {
      question: "What are Spark Points used for?",
      answer: "Spark Points are our virtual currency used for uploading projects, accessing premium content, and utilizing various services like document processing, design work, and more."
    },
    {
      question: "I found a bug in the application, how do I report it?",
      answer: "You can report any bugs or issues through our Help page. Select 'Technical Issue' as the error type and provide as much detail as possible."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground mt-2">
              Get assistance with your account, transactions, and more
            </p>
          </div>
          
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="report">Report an Issue</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="services">Service Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="report">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Report an Issue
                  </CardTitle>
                  <CardDescription>
                    Let us know about any problems you're experiencing with our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="errorType">Issue Type</Label>
                      <Select 
                        value={errorType} 
                        onValueChange={setErrorType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Payment/Transaction Issue</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="technical">
                            <div className="flex items-center gap-2">
                              <Bug className="h-4 w-4" />
                              <span>Technical Issue</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="upload">
                            <div className="flex items-center gap-2">
                              <FileQuestion className="h-4 w-4" />
                              <span>Upload Problem</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="other">
                            <div className="flex items-center gap-2">
                              <MessageSquareWarning className="h-4 w-4" />
                              <span>Other Issue</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {errorType === "transaction" && (
                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input 
                          id="transactionId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter your UPI transaction ID"
                        />
                        <p className="text-xs text-muted-foreground">
                          This is the ID you received from your UPI app after making the payment
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe the issue in detail"
                        rows={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll use this email to contact you about your report
                      </p>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSubmitReport} 
                    disabled={isSubmitting || !description}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Find answers to common questions about our platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Still have questions? Contact us at <span className="font-medium">support@mpa.example.com</span>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Service Pricing
                  </CardTitle>
                  <CardDescription>
                    Our service pricing is listed in Spark Points (SP)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Document & Media Services</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>Word Processing</span>
                        <Badge variant="outline" className="font-medium">10 SP per page</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Excel Work</span>
                        <Badge variant="outline" className="font-medium">15 SP per 10×10 sheet</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Presentation Slides</span>
                        <Badge variant="outline" className="font-medium">10 SP per slide</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Photo Editing</span>
                        <Badge variant="outline" className="font-medium">35 SP per image</Badge>
                      </li>
                      <li>
                        <div className="flex justify-between items-center">
                          <span>Video Editing</span>
                        </div>
                        <ul className="pl-6 mt-1 space-y-1">
                          <li className="flex justify-between items-center">
                            <span className="text-sm">Up to 10 min</span>
                            <Badge variant="outline" className="font-medium">80 SP</Badge>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm">YouTube Shorts</span>
                            <Badge variant="outline" className="font-medium">8 SP</Badge>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm">Long Video (30 min)</span>
                            <Badge variant="outline" className="font-medium">200 SP</Badge>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">3D & CAD Services</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>3D Object Modeling</span>
                        <Badge variant="outline" className="font-medium">50 SP per object</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>3D Circuit Design</span>
                        <Badge variant="outline" className="font-medium">100 SP per circuit</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>AutoCAD 2D Design</span>
                        <Badge variant="outline" className="font-medium">100 to 350 SP</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>AutoCAD 3D Design</span>
                        <Badge variant="outline" className="font-medium">200 to 800 SP</Badge>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Web Development & Hosting</h3>
                    <ul className="space-y-2">
                      <li>
                        <div className="flex justify-between items-center">
                          <span>Website Hosting on Blog</span>
                        </div>
                        <ul className="pl-6 mt-1 space-y-1">
                          <li className="flex justify-between items-center">
                            <span className="text-sm">Advanced Setup</span>
                            <Badge variant="outline" className="font-medium">100 SP</Badge>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-sm">Monthly Maintenance</span>
                            <Badge variant="outline" className="font-medium">50 SP</Badge>
                          </li>
                        </ul>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Web Design (HTML & CSS only)</span>
                        <Badge variant="outline" className="font-medium">70 SP</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Website Widget Development</span>
                        <Badge variant="outline" className="font-medium">35 SP</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>HTML Coding</span>
                        <Badge variant="outline" className="font-medium">35 SP per 100 lines</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>CSS Coding</span>
                        <Badge variant="outline" className="font-medium">35 SP per 400 lines</Badge>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>JavaScript Functions</span>
                        <Badge variant="outline" className="font-medium">4 SP per function</Badge>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Automation & Bots</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between items-center">
                        <span>WhatsApp, Instagram, Discord Bots</span>
                        <Badge variant="outline" className="font-medium">200 SP</Badge>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Need Further Assistance?</AlertTitle>
            <AlertDescription>
              Our support team is available 24/7. You can also reach us at support@mpa.example.com or call us at +1-234-567-8900.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default Help;
