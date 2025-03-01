
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Search,
  HelpCircle,
  FileText,
  CreditCard,
  PanelLeft,
  LinkIcon,
  ShieldAlert,
} from "lucide-react";

const FAQs = [
  {
    category: "account",
    title: "Account & Profile",
    items: [
      {
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Login' button in the top-right corner and then select 'Sign Up'. Enter your email address and password, then follow the verification instructions sent to your email."
      },
      {
        question: "Can I change my username?",
        answer: "Yes, you can change your username in the Account Settings page. Go to your profile, click on 'Account Settings', and update your username in the profile section."
      },
      {
        question: "How do I update my profile information?",
        answer: "You can update your profile information by navigating to 'Account Settings' from the user menu. There, you can edit your profile details, update your avatar, and change your preferences."
      }
    ]
  },
  {
    category: "payments",
    title: "Payments & Spark Points",
    items: [
      {
        question: "What are Spark Points (SP)?",
        answer: "Spark Points (SP) are our platform's digital currency. You can use them to purchase various services, including document processing, design work, and web development services."
      },
      {
        question: "How do I buy Spark Points?",
        answer: "You can purchase Spark Points from the Subscription page. We currently accept UPI payments. Simply select the package you want, make the payment to our UPI ID, and enter the transaction reference."
      },
      {
        question: "What if my payment fails or I have issues?",
        answer: "If you experience any payment issues, please report them immediately through our Error Report page. Include your transaction ID and details about the problem, and our team will assist you as soon as possible."
      },
      {
        question: "Do Spark Points expire?",
        answer: "No, your Spark Points do not expire and will remain in your account until you use them."
      }
    ]
  },
  {
    category: "services",
    title: "Services & Uploads",
    items: [
      {
        question: "What services do you offer?",
        answer: "We offer a wide range of services including document processing, graphic design, video editing, 3D modeling, CAD design, web development, and bot development. You can find a complete list with prices on our Upload page."
      },
      {
        question: "How do I request a service?",
        answer: "To request a service, go to the Upload page, select the service you need, fill out the requirements form, and submit your request. You'll need sufficient Spark Points to complete the transaction."
      },
      {
        question: "What's the turnaround time for services?",
        answer: "Turnaround times vary depending on the service and complexity. Simple document processing might take 1-2 days, while more complex services like video editing or CAD design could take 3-7 days. You'll receive an estimated completion time after submitting your request."
      }
    ]
  },
  {
    category: "technical",
    title: "Technical Support",
    items: [
      {
        question: "The site isn't working properly. What should I do?",
        answer: "First, try refreshing the page or clearing your browser cache. If problems persist, try using a different browser. If you still experience issues, please report them through our Error Report page with details about what's happening."
      },
      {
        question: "How do I report a bug or error?",
        answer: "You can report bugs or errors through our Error Report page. Provide as much detail as possible, including what you were doing when the error occurred and any error messages you received."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, we take data security seriously. We use encryption for sensitive data and follow industry best practices to protect your information. We never share your personal data with third parties without your consent."
      }
    ]
  }
];

const PRICING_DATA = {
  document_media: [
    { service: "Word Processing", price: "10 SP per page" },
    { service: "Excel Work", price: "15 SP per 10×10 sheet" },
    { service: "Presentation Slides", price: "10 SP per slide" },
    { service: "Photo Editing", price: "35 SP per image" },
    { service: "Video Editing (up to 10 min)", price: "80 SP" },
    { service: "YouTube Shorts", price: "8 SP" },
    { service: "Long Video (30 min)", price: "200 SP" },
  ],
  design_3d: [
    { service: "3D Object Modeling", price: "50 SP per object" },
    { service: "3D Circuit Design", price: "100 SP per circuit" },
    { service: "AutoCAD 2D Design", price: "100 to 350 SP (based on complexity)" },
    { service: "AutoCAD 3D Design", price: "200 to 800 SP (based on complexity)" },
  ],
  web_development: [
    { service: "Website Hosting on Blog (Advanced Setup)", price: "100 SP" },
    { service: "Website Hosting on Blog (Monthly Maintenance)", price: "50 SP" },
    { service: "Web Design (HTML & CSS only)", price: "70 SP" },
    { service: "Website Widget Development", price: "35 SP" },
    { service: "HTML Coding", price: "35 SP per 100 lines" },
    { service: "CSS Coding", price: "35 SP per 400 lines" },
    { service: "JavaScript Functions", price: "4 SP per function" },
  ],
  automation: [
    { service: "WhatsApp, Instagram, Discord Bots", price: "200 SP" },
  ]
};

function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFAQs, setFilteredFAQs] = useState(FAQs);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFAQs(FAQs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = FAQs.map(category => {
      const filteredItems = category.items.filter(
        item => 
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query)
      );
      
      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0);
    
    setFilteredFAQs(filtered);
  }, [searchQuery]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Help Center</h1>
      <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
        Find answers to common questions, learn about our services, or report issues you're experiencing.
      </p>
      
      <div className="relative mb-8 max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search for help..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="faq">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="faq">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="report">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Report Issue</span>
          </TabsTrigger>
          <TabsTrigger value="guides">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Guides</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about our platform and services.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-gray-500 mt-2">
                    We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {filteredFAQs.map((category, idx) => (
                    <AccordionItem key={category.category} value={category.category}>
                      <AccordionTrigger>
                        <span className="font-medium">{category.title}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mt-2">
                          {category.items.map((item, i) => (
                            <div key={i} className="rounded-lg border p-4">
                              <h4 className="font-medium mb-2">{item.question}</h4>
                              <p className="text-sm text-gray-600">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Can't find what you're looking for?
              </p>
              <Button variant="outline" onClick={() => navigate("/report-error")}>
                Contact Support
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Service Pricing</CardTitle>
              <CardDescription>
                Explore our services and their Spark Point (SP) costs.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Document & Media Services</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Price (SP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_DATA.document_media.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.service}</TableCell>
                          <TableCell className="text-right">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">3D & CAD Services</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Price (SP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_DATA.design_3d.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.service}</TableCell>
                          <TableCell className="text-right">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Web Development & Hosting</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Price (SP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_DATA.web_development.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.service}</TableCell>
                          <TableCell className="text-right">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Automation & Bots</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Price (SP)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_DATA.automation.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.service}</TableCell>
                          <TableCell className="text-right">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/subscription")}>
                Buy Spark Points
              </Button>
              <Button onClick={() => navigate("/upload")}>
                Request Service
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
              <CardDescription>
                Experiencing problems with our platform? Let us know so we can help.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="border border-gray-200 hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-primary" />
                      Payment Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">
                      Problems with payments, missing Spark Points, or transaction errors
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/report-error?error_type=transaction")}
                    >
                      Report Payment Issue
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border border-gray-200 hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PanelLeft className="mr-2 h-5 w-5 text-primary" />
                      Technical Problems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">
                      Website errors, loading issues, or other technical difficulties
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/report-error?error_type=technical")}
                    >
                      Report Technical Issue
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border border-gray-200 hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                      Account Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">
                      Problems with logging in, account settings, or profile information
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/report-error?error_type=account")}
                    >
                      Report Account Issue
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border border-gray-200 hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
                      Other Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">
                      Any other problems not covered by the categories above
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/report-error?error_type=other")}
                    >
                      Report Other Issue
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Need immediate assistance?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        For urgent issues, especially regarding payments, please include your contact details in your report so we can reach out to you directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button onClick={() => navigate("/report-error")} className="w-full">
                Go to Error Report Form
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>
                Learn how to use our platform effectively with these helpful guides.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">
                      New to our platform? Follow this guide to set up your account and get started.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">1</span>
                        <span>Create your account</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">2</span>
                        <span>Purchase Spark Points</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">3</span>
                        <span>Submit your first service request</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="px-0" onClick={() => navigate("/")}>
                      Read full guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payment Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to purchase Spark Points and verify your payments.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">1</span>
                        <span>Select a Spark Points package</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">2</span>
                        <span>Make UPI payment to "ja.jamalasraf@fam"</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">3</span>
                        <span>Enter the transaction reference</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="px-0" onClick={() => navigate("/subscription")}>
                      Read full guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Service Request Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">
                      How to submit service requests and get the best results.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">1</span>
                        <span>Choose the right service category</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">2</span>
                        <span>Provide detailed requirements</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-purple-100 text-purple-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">3</span>
                        <span>Track and approve completed work</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="px-0" onClick={() => navigate("/upload")}>
                      Read full guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Referral Program</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to earn bonus Spark Points by referring friends.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">1</span>
                        <span>Share your unique referral code</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">2</span>
                        <span>Friend signs up using your code</span>
                      </li>
                      <li className="flex items-center">
                        <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 font-medium text-xs">3</span>
                        <span>Both of you receive 10 SP bonus</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="px-0" onClick={() => navigate("/referral")}>
                      Read full guide
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Help;
