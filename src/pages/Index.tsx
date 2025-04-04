import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Gift, Layout, Shield, Upload, Users, ArrowRight, ExternalLink, CheckCircle, Star, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { FloatingTab } from "@/components/ui/floating-tab";
import { useTheme } from "next-themes";
import { FeaturedPosts } from "@/components/home/FeaturedPosts";
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer";

const featureItems = [
  {
    icon: <Layout className="h-10 w-10 text-primary" />,
    title: "Intuitive Dashboard",
    description: "Access all your projects from a single, easy-to-use dashboard."
  },
  {
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: "Easy Uploads",
    description: "Securely upload and manage your files with just a few clicks."
  },
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "Detailed Analytics",
    description: "Track your project performance with comprehensive analytics."
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Team Collaboration",
    description: "Work seamlessly with your team members in real-time."
  },
  {
    icon: <Gift className="h-10 w-10 text-primary" />,
    title: "Referral Program",
    description: "Refer friends and earn rewards for growing our community."
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "Secure Platform",
    description: "Enterprise-grade security to protect your valuable data."
  }
];

const testimonials = [
  {
    quote: "MPA has revolutionized how we manage multiple projects. The interface is intuitive and the analytics are spot-on!",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "Tech Innovations"
  },
  {
    quote: "We've seen a 40% increase in team productivity since switching to MPA. It's now an essential part of our workflow.",
    author: "Michael Chen",
    role: "Team Lead",
    company: "Creative Solutions"
  },
  {
    quote: "The ability to track progress across multiple projects simultaneously has been a game-changer for our organization.",
    author: "Priya Sharma",
    role: "Operations Director",
    company: "Global Enterprises"
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Index = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
    setTheme("dark");
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Multi Project Association',
        text: 'Check out this awesome project management platform!',
        url: window.location.href,
      })
        .then(() => toast.success('Shared successfully!'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };
  
  const handleExternalLink = (url: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (window.navigator && (window.navigator as any).app) {
      if ((window as any).cordova && (window as any).cordova.InAppBrowser) {
        (window as any).cordova.InAppBrowser.open(url, '_system');
      } else if ((window as any).open) {
        (window as any).open(url, '_system');
      } else {
        window.location.href = url;
      }
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-10">
            <motion.div
              className="space-y-4 max-w-3xl"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Multi Project Association
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Simplify your workflow. Amplify your results. 🚀
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {user ? (
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth">
                      Get Started Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full max-w-5xl"
            >
              <div className="rounded-lg overflow-hidden shadow-xl border">
                <img
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEij_8C9_qMdECGZa0UUncGrqMM9n6tv-UBDGiM07gzf5URWbreQHVl_O0LE1GualqnA0AD80ytin-LXUdNUVLYuYr5fumesM5GMcz1s7MqThZTT2GoTHcPCm38nO7bIABwLh9GVHqT5X1sae44ZRxXom3EnFAw6aNLOljYsZ4WRomr5Eg/s1600/dashboard.jpg"
                  alt="MPA Dashboard Preview"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                  <Badge className="text-sm px-3 py-1 bg-primary/90 hover:bg-primary transition-colors">
                    Dashboard Preview
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Posts</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Stay updated with our latest featured articles
            </p>
          </div>

          <FeaturedPosts />
          
          <div className="flex justify-center mt-10">
            <Button asChild variant="outline">
              <Link to="/blog" className="gap-2">
                View All Posts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-10">
        <div className="container px-4 md:px-6">
          <WidgetRenderer location="homepage" />
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Features that Elevate Your Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Everything you need to manage projects effectively in one place.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featureItems.map((feature, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full transition-transform duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="p-2 rounded-full w-fit bg-primary/10 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Trusted by Teams Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              See what our users are saying about MPA.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeIn}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex text-yellow-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.author}`} />
                        <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="container px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Streamline Your Projects?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of teams who use MPA to manage their projects efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth">
                    Get Started for Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={(e) => handleExternalLink("/features", e)}
              >
                Explore Features
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      <FloatingTab />
    </div>
  );
};

export default Index;
