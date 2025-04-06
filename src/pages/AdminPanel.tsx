import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { LoadingPage } from "@/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Copy, Check, Users, AlertTriangle, FileText, Settings, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isRoleRequestModalOpen, setIsRoleRequestModalOpen] = useState(false);
  const [roleRequests, setRoleRequests] = useState([]);
  const [selectedRoleRequest, setSelectedRoleRequest] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price_in_points: 0,
    category: "",
    image_url: "",
    details: {},
    requirements: [],
  });
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [newWidget, setNewWidget] = useState({
    title: "",
    description: "",
    type: "",
    code: "",
    settings: {},
    location: "",
    priority: 0,
  });
  const [isWidgetActive, setIsWidgetActive] = useState(false);
  const [isWidgetPriority, setIsWidgetPriority] = useState(0);
  const [isWidgetLocation, setIsWidgetLocation] = useState("");
  const [isWidgetSettings, setIsWidgetSettings] = useState({});
  const [isWidgetCode, setIsWidgetCode] = useState("");
  const [isWidgetType, setIsWidgetType] = useState("");
  const [isWidgetDescription, setIsWidgetDescription] = useState("");
  const [isWidgetTitle, setIsWidgetTitle] = useState("");
  const [isErrorReportModalOpen, setIsErrorReportModalOpen] = useState(false);
  const [errorReports, setErrorReports] = useState([]);
  const [selectedErrorReport, setSelectedErrorReport] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [errorReportStats, setErrorReportStats] = useState({});
  const [isServiceOfferModalOpen, setIsServiceOfferModalOpen] = useState(false);
  const [serviceOffers, setServiceOffers] = useState([]);
  const [newServiceOffer, setNewServiceOffer] = useState({
    name: "",
    description: "",
    point_cost: 0,
    discount_percentage: 0,
    start_date: "",
    end_date: "",
    is_active: false,
    per_page_pricing: false,
  });
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [footerContent, setFooterContent] = useState(null);
  const [newFooterContent, setNewFooterContent] = useState({
    about_text: "",
    terms_text: "",
    privacy_text: "",
    contact_email: "",
    social_links: {},
  });
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    user_id: "",
    published: false,
    featured: false,
    excerpt: "",
    thumbnail_url: "",
    category: "",
  });
  const [isPostPublished, setIsPostPublished] = useState(false);
  const [isPostFeatured, setIsPostFeatured] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingWidget, setIsSavingWidget] = useState(false);
  const [isSavingServiceOffer, setIsSavingServiceOffer] = useState(false);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [isFetchingRoleRequests, setIsFetchingRoleRequests] = useState(false);
  const [isFetchingErrorReports, setIsFetchingErrorReports] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [isFetchingWidgets, setIsFetchingWidgets] = useState(false);
  const [isFetchingServiceOffers, setIsFetchingServiceOffers] = useState(false);
  const [isFetchingFooterContent, setIsFetchingFooterContent] = useState(false);
  const [isFetchingPosts, setIsFetchingPosts] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isSavingPostError, setIsSavingPostError] = useState("");
  const [isSavingServiceError, setIsSavingServiceError] = useState("");
  const [isSavingWidgetError, setIsSavingWidgetError] = useState("");
  const [isSavingServiceOfferError, setIsSavingServiceOfferError] = useState("");
  const [isSavingFooterError, setIsSavingFooterError] = useState("");
  const [isFetchingErrorReportStats, setIsFetchingErrorReportStats] = useState(false);
  const [isSavingErrorReportError, setIsSavingErrorReportError] = useState("");
  const [isSavingRoleRequestError, setIsSavingRoleRequestError] = useState("");
  const [isSavingUserError, setIsSavingUserError] = useState("");

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast.error(`Failed to load users: ${error.message}`);
        setIsSavingUserError(error.message);
      } finally {
        setLoading(false);
        setIsFetchingUsers(false);
      }
    };

    const fetchRoleRequests = async () => {
      setIsFetchingRoleRequests(true);
      try {
        const { data, error } = await supabase
          .from("role_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRoleRequests(data);
      } catch (error: any) {
        console.error("Error fetching role requests:", error);
        toast.error(`Failed to load role requests: ${error.message}`);
        setIsSavingRoleRequestError(error.message);
      } finally {
        setIsFetchingRoleRequests(false);
      }
    };

    const fetchErrorReports = async () => {
      setIsFetchingErrorReports(true);
      try {
        const { data, error } = await supabase
          .from("error_reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setErrorReports(data);
      } catch (error: any) {
        console.error("Error fetching error reports:", error);
        toast.error(`Failed to load error reports: ${error.message}`);
        setIsSavingErrorReportError(error.message);
      } finally {
        setIsFetchingErrorReports(false);
      }
    };

    const fetchServices = async () => {
      setIsFetchingServices(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data);
      } catch (error: any) {
        console.error("Error fetching services:", error);
        toast.error(`Failed to load services: ${error.message}`);
        setIsSavingServiceError(error.message);
      } finally {
        setIsFetchingServices(false);
      }
    };

    const fetchWidgets = async () => {
      setIsFetchingWidgets(true);
      try {
        const { data, error } = await supabase
          .from("widgets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setWidgets(data);
      } catch (error: any) {
        console.error("Error fetching widgets:", error);
        toast.error(`Failed to load widgets: ${error.message}`);
        setIsSavingWidgetError(error.message);
      } finally {
        setIsFetchingWidgets(false);
      }
    };

    const fetchServiceOffers = async () => {
      setIsFetchingServiceOffers(true);
      try {
        const { data, error } = await supabase
          .from("service_offers")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServiceOffers(data);
      } catch (error: any) {
        console.error("Error fetching service offers:", error);
        toast.error(`Failed to load service offers: ${error.message}`);
        setIsSavingServiceOfferError(error.message);
      } finally {
        setIsFetchingServiceOffers(false);
      }
    };

    const fetchFooterContent = async () => {
      setIsFetchingFooterContent(true);
      try {
        const { data, error } = await supabase
          .from("footer_content")
          .select("*")
          .single();

        if (error) throw error;
        setFooterContent(data);
      } catch (error: any) {
        console.error("Error fetching footer content:", error);
        toast.error(`Failed to load footer content: ${error.message}`);
        setIsSavingFooterError(error.message);
      } finally {
        setIsFetchingFooterContent(false);
      }
    };

    const fetchPosts = async () => {
      setIsFetchingPosts(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data);
      } catch (error: any) {
        console.error("Error fetching posts:", error);
        toast.error(`Failed to load posts: ${error.message}`);
        setIsSavingPostError(error.message);
      } finally {
        setIsFetchingPosts(false);
      }
    };

    const fetchErrorReportStats = async () => {
      setIsFetchingErrorReportStats(true);
      try {
        const { data, error } = await supabase.rpc("get_error_report_stats");

        if (error) throw error;
        setErrorReportStats(data);
      } catch (error: any) {
        console.error("Error fetching error report stats:", error);
        toast.error(`Failed to load error report stats: ${error.message}`);
        setIsSavingErrorReportError(error.message);
      } finally {
        setIsFetchingErrorReportStats(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
      fetchRoleRequests();
      fetchErrorReports();
      fetchServices();
      fetchWidgets();
      fetchServiceOffers();
      fetchFooterContent();
      fetchPosts();
      fetchErrorReportStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const profilesChannel = supabase
      .channel("admin-changes-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setUsers((prevUsers) => {
              const updatedUser = payload.new;
              const existingUserIndex = prevUsers.findIndex(
                (user) => user.id === updatedUser.id
              );

              if (existingUserIndex > -1) {
                const newUsers = [...prevUsers];
                newUsers[existingUserIndex] = updatedUser;
                return newUsers;
              } else {
                return [...prevUsers, updatedUser];
              }
            });
          } else if (payload.eventType === "DELETE") {
            setUsers((prevUsers) =>
              prevUsers.filter((user) => user.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    const roleRequestsChannel = supabase
      .channel("admin-role-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_requests" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchRoleRequests();
          }
        }
      )
      .subscribe();

    const errorReportsChannel = supabase
      .channel("admin-error-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "error_reports" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchErrorReports();
            fetchErrorReportStats();
          }
        }
      )
      .subscribe();

    const servicesChannel = supabase
      .channel("admin-services")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchServices();
          }
        }
      )
      .subscribe();

    const widgetsChannel = supabase
      .channel("admin-widgets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "widgets" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchWidgets();
          }
        }
      )
      .subscribe();

    const serviceOffersChannel = supabase
      .channel("admin-service-offers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_offers" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchServiceOffers();
          }
        }
      )
      .subscribe();

    const footerContentChannel = supabase
      .channel("admin-footer-content")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "footer_content" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchFooterContent();
          }
        }
      )
      .subscribe();

    const postsChannel = supabase
      .channel("admin-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT" ||
            payload.eventType === "DELETE"
          ) {
            fetchPosts();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(roleRequestsChannel);
      supabase.removeChannel(errorReportsChannel);
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(widgetsChannel);
      supabase.removeChannel(serviceOffersChannel);
      supabase.removeChannel(footerContentChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [isAdmin]);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      toast.success("User role updated successfully!");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(`Failed to update user role: ${error.message}`);
      setIsSavingUserError(error.message);
    } finally {
      setSelectedUser(null);
      setNewRole("");
    }
  };

  const handleApiKeyRegen = async () => {
    if (!selectedUser) return;

    setIsApiKeyLoading(true);
    try {
      const newApiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      setApiKey(newApiKey);
      setIsApiKeyModalOpen(true);
    } catch (error: any) {
      console.error("Error generating API key:", error);
      toast.error(`Failed to generate API key: ${error.message}`);
      setIsSavingUserError(error.message);
    } finally {
      setIsApiKeyLoading(false);
    }
  };

  const handleApproveRoleRequest = async () => {
    if (!selectedRoleRequest) return;

    setIsApproving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRoleRequest.requested_role })
        .eq("id", selectedRoleRequest.target_user_id);

      if (error) throw error;

      const { error: requestError } = await supabase
        .from("role_requests")
        .update({ status: "approved", approver_id: user.id })
        .eq("id", selectedRoleRequest.id);

      if (requestError) throw requestError;

      setRoleRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === selectedRoleRequest.id
            ? { ...request, status: "approved", approver_id: user.id }
            : request
        )
      );
      toast.success("Role request approved successfully!");
    } catch (error: any) {
      console.error("Error approving role request:", error);
      toast.error(`Failed to approve role request: ${error.message}`);
      setIsSavingRoleRequestError(error.message);
    } finally {
      setIsApproving(false);
      setSelectedRoleRequest(null);
    }
  };

  const handleRejectRoleRequest = async () => {
    if (!selectedRoleRequest) return;

    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from("role_requests")
        .update({ status: "rejected", approver_id: user.id })
        .eq("id", selectedRoleRequest.id);

      if (error) throw error;

      setRoleRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === selectedRoleRequest.id
            ? { ...request, status: "rejected", approver_id: user.id }
            : request
        )
      );
      toast.success("Role request rejected successfully!");
    } catch (error: any) {
      console.error("Error rejecting role request:", error);
      toast.error(`Failed to reject role request: ${error.message}`);
      setIsSavingRoleRequestError(error.message);
    } finally {
      setIsRejecting(false);
      setSelectedRoleRequest(null);
    }
  };

  const handleResolveErrorReport = async () => {
    if (!selectedErrorReport) return;

    setIsResolving(true);
    try {
      const { error } = await supabase
        .from("error_reports")
        .update({
          status: "resolved",
          resolution_notes: resolutionNotes,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", selectedErrorReport.id);

      if (error) throw error;

      setErrorReports((prevReports) =>
        prevReports.map((report) =>
          report.id === selectedErrorReport.id
            ? {
                ...report,
                status: "resolved",
                resolution_notes: resolutionNotes,
                resolved_by: user.id,
                resolved_at: new Date().toISOString(),
              }
            : report
        )
      );
      toast.success("Error report resolved successfully!");
    } catch (error: any) {
      console.error("Error resolving error report:", error);
      toast.error(`Failed to resolve error report: ${error.message}`);
      setIsSavingErrorReportError(error.message);
    } finally {
      setIsResolving(false);
      setSelectedErrorReport(null);
      setResolutionNotes("");
    }
  };

  const handleCreateService = async () => {
    setIsSavingService(true);
    try {
      const { error } = await supabase
        .from("services")
        .insert({
          ...newService,
          created_by: user.id,
        });

      if (error) throw error;

      setServices((prevServices) => [...prevServices, newService]);
      toast.success("Service created successfully!");
    } catch (error: any) {
      console.error("Error creating service:", error);
      toast.error(`Failed to create service: ${error.message}`);
      setIsSavingServiceError(error.message);
    } finally {
      setIsSavingService(false);
      setIsServiceModalOpen(false);
      setNewService({
        name: "",
        description: "",
        price_in_points: 0,
        category: "",
        image_url: "",
        details: {},
        requirements: [],
      });
    }
  };

  const handleCreateWidget = async () => {
    setIsSavingWidget(true);
    try {
      const { error } = await supabase
        .from("widgets")
        .insert({
          title: isWidgetTitle,
          description: isWidgetDescription,
          type: isWidgetType,
          code: isWidgetCode,
          settings: isWidgetSettings,
          created_by: user.id,
          location: isWidgetLocation,
          active: isWidgetActive,
          priority: isWidgetPriority,
        });

      if (error) throw error;

      setWidgets((prevWidgets) => [
        ...prevWidgets,
        {
          title: isWidgetTitle,
          description: isWidgetDescription,
          type: isWidgetType,
          code: isWidgetCode,
          settings: isWidgetSettings,
          created_by: user.id,
          location: isWidgetLocation,
          active: isWidgetActive,
          priority: isWidgetPriority,
        },
      ]);
      toast.success("Widget created successfully!");
    } catch (error: any) {
      console.error("Error creating widget:", error);
      toast.error(`Failed to create widget: ${error.message}`);
      setIsSavingWidgetError(error.message);
    } finally {
      setIsSavingWidget(false);
      setIsWidgetModalOpen(false);
      setNewWidget({
        title: "",
        description: "",
        type: "",
        code: "",
        settings: {},
        location: "",
        priority: 0,
      });
      setIsWidgetTitle("");
      setIsWidgetDescription("");
      setIsWidgetType("");
      setIsWidgetCode("");
      setIsWidgetSettings({});
      setIsWidgetLocation("");
      setIsWidgetActive(false);
      setIsWidgetPriority(0);
    }
  };

  const handleCreateServiceOffer = async () => {
    setIsSavingServiceOffer(true);
    try {
      const { error } = await supabase
        .from("service_offers")
        .insert(newServiceOffer);

      if (error) throw error;

      setServiceOffers((prevServiceOffers) => [
        ...prevServiceOffers,
        newServiceOffer,
      ]);
      toast.success("Service offer created successfully!");
    } catch (error: any) {
      console.error("Error creating service offer:", error);
      toast.error(`Failed to create service offer: ${error.message}`);
      setIsSavingServiceOfferError(error.message);
    } finally {
      setIsSavingServiceOffer(false);
      setIsServiceOfferModalOpen(false);
      setNewServiceOffer({
        name: "",
        description: "",
        point_cost: 0,
        discount_percentage: 0,
        start_date: "",
        end_date: "",
        is_active: false,
        per_page_pricing: false,
      });
    }
  };

  const handleCreateFooterContent = async () => {
    setIsSavingFooter(true);
    try {
      const { error } = await supabase
        .from("footer_content")
        .insert(newFooterContent);

      if (error) throw error;

      setFooterContent(newFooterContent);
      toast.success("Footer content created successfully!");
    } catch (error: any) {
      console.error("Error creating footer content:", error);
      toast.error(`Failed to create footer content: ${error.message}`);
      setIsSavingFooterError(error.message);
    } finally {
      setIsSavingFooter(false);
      setIsFooterModalOpen(false);
      setNewFooterContent({
        about_text: "",
        terms_text: "",
        privacy_text: "",
        contact_email: "",
        social_links: {},
      });
    }
  };

  const handleCreatePost = async () => {
    setIsSavingPost(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          ...newPost,
          user_id: user.id,
          published: isPostPublished,
          featured: isPostFeatured,
        });

      if (error) throw error;

      setPosts((prevPosts) => [
        ...prevPosts,
        {
          ...newPost,
          user_id: user.id,
          published: isPostPublished,
          featured: isPostFeatured,
        },
      ]);
      toast.success("Post created successfully!");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(`Failed to create post: ${error.message}`);
      setIsSavingPostError(error.message);
    } finally {
      setIsSavingPost(false);
      setIsPostModalOpen(false);
      setNewPost({
        title: "",
        content: "",
        user_id: "",
        published: false,
        featured: false,
        excerpt: "",
        thumbnail_url: "",
        category: "",
      });
      setIsPostPublished(false);
      setIsPostFeatured(false);
    }
  };

  const fetchRoleRequests = async () => {
    setIsFetchingRoleRequests(true);
    try {
      const { data, error } = await supabase
        .from("role_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoleRequests(data);
    } catch (error: any) {
      console.error("Error fetching role requests:", error);
      toast.error(`Failed to load role requests: ${error.message}`);
      setIsSavingRoleRequestError(error.message);
    } finally {
      setIsFetchingRoleRequests(false);
    }
  };

  const fetchErrorReports = async () => {
    setIsFetchingErrorReports(true);
    try {
      const { data, error } = await supabase
        .from("error_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setErrorReports(data);
    } catch (error: any) {
      console.error("Error fetching error reports:", error);
      toast.error(`Failed to load error reports: ${error.message}`);
      setIsSavingErrorReportError(error.message);
    } finally {
      setIsFetchingErrorReports(false);
    }
  };

  const fetchServices = async () => {
    setIsFetchingServices(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error(`Failed to load services: ${error.message}`);
      setIsSavingServiceError(error.message);
    } finally {
      setIsFetchingServices(false);
    }
  };

  const fetchWidgets = async () => {
    setIsFetchingWidgets(true);
    try {
      const { data, error } = await supabase
        .from("widgets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWidgets(data);
    } catch (error: any) {
      console.error("Error fetching widgets:", error);
      toast.error(`Failed to load widgets: ${error.message}`);
      setIsSavingWidgetError(error.message);
    } finally {
      setIsFetchingWidgets(false);
    }
  };

  const fetchServiceOffers = async () => {
    setIsFetchingServiceOffers(true);
    try {
      const { data, error } = await supabase
        .from("service_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServiceOffers(data);
    } catch (error: any) {
      console.error("Error fetching service offers:", error);
      toast.error(`Failed to load service offers: ${error.message}`);
      setIsSavingServiceOfferError(error.message);
    } finally {
      setIsFetchingServiceOffers(false);
    }
  };

  const fetchFooterContent = async () => {
    setIsFetchingFooterContent(true);
    try {
      const { data, error } = await supabase
        .from("footer_content")
        .select("*")
        .single();

      if (error) throw error;
      setFooterContent(data);
    } catch (error: any) {
      console.error("Error fetching footer content:", error);
      toast.error(`Failed to load footer content: ${error.message}`);
      setIsSavingFooterError(error.message);
    } finally {
      setIsFetchingFooterContent(false);
    }
  };

  const fetchPosts = async () => {
    setIsFetchingPosts(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error(`Failed to load posts: ${error.message}`);
      setIsSavingPostError(error.message);
    } finally {
      setIsFetchingPosts(false);
    }
  };

  const fetchErrorReportStats = async () => {
    setIsFetchingErrorReportStats(true);
    try {
      const { data, error } = await supabase.rpc("get_error_report_stats");

      if (error) throw error;
      setErrorReportStats(data);
    } catch (error: any) {
      console.error("Error fetching error report stats:", error);
      toast.error(`Failed to load error report stats: ${error.message}`);
      setIsSavingErrorReportError(error.message);
    } finally {
      setIsFetchingErrorReportStats(false);
    }
  };

  if (loading || isAdminLoading) {
    return <LoadingPage />;
  }

  const copyApiKeyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setIsApiKeyCopied(true);
    toast.success("API Key copied to clipboard!");
    setTimeout(() => {
      setIsApiKeyCopied(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage users and roles</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[150px]">
              <p className="font-medium">Total users: {users.length}</p>
              <div className="mt-2">
                <Button size="sm" className="w-full" onClick={() => setSelectedUser(users[0])}>
                  Manage Users
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error Reports
            </CardTitle>
            <CardDescription>Manage reported errors</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[150px]">
              <p className="font-medium">Total reports: {errorReports.length}</p>
              <div className="mt-2">
                <Button size="sm" className="w-full" onClick={() => setIsErrorReportModalOpen(true)}>
                  View Reports
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Posts & Content
            </CardTitle>
            <CardDescription>Manage content</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[150px]">
              <p className="font-medium">Total posts: {posts.length}</p>
              <div className="mt-2">
                <Button size="sm" className="w-full" onClick={() => setIsPostModalOpen(true)}>
                  Manage Content
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>Configure system settings</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Services: {services.length}</h3>
                  <Button size="sm" className="mt-1" onClick={() => setIsServiceModalOpen(true)}>
                    Manage Services
                  </Button>
                </div>
                <div>
                  <h3 className="font-medium">Widgets: {widgets.length}</h3>
                  <Button size="sm" className="mt-1" onClick={() => setIsWidgetModalOpen(true)}>
                    Manage Widgets
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-rose-50 dark:bg-rose-900/20">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics Overview
            </CardTitle>
            <CardDescription>System stats and metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                {errorReportStats && (
                  <div>
                    <h3 className="font-medium">Error Reports</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>Pending: {errorReportStats.pending || 0}</div>
                      <div>Resolved: {errorReportStats.resolved || 0}</div>
                      <div>In Progress: {errorReportStats.in_progress || 0}</div>
                      <div>Total: {errorReportStats.total || 0}</div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Referrals</h3>
                  <Button size="sm" className="mt-1" onClick={() => navigate("/referral")}>
                    View Referrals
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key</DialogTitle>
            <DialogDescription>Copy this API key for your applications</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={apiKey} readOnly />
            <Button size="icon" onClick={copyApiKeyToClipboard}>
              {isApiKeyCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsApiKeyModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Other dialogs could be added here as needed */}
    </div>
  );
};

export default AdminPanel;
