
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ThumbsUp, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
}

const samplePosts: Post[] = [
  {
    id: 1,
    title: "Getting Started with Modern Web Development",
    content: "Learn the essential tools and practices for building modern web applications. We'll cover the latest frameworks, best practices, and development workflows that will help you create better applications.",
    author: "Sarah Johnson",
    date: "2024-03-15",
    likes: 45,
    comments: 12
  },
  {
    id: 2,
    title: "Understanding State Management",
    content: "Dive deep into different state management approaches and learn when to use each one. From local state to global solutions, we'll explore the best practices for managing application state.",
    author: "Michael Chen",
    date: "2024-03-14",
    likes: 38,
    comments: 8
  },
  {
    id: 3,
    title: "Performance Optimization Techniques",
    content: "Discover practical techniques to improve your application's performance. From code splitting to caching strategies, learn how to make your app faster and more efficient.",
    author: "Alex Rivera",
    date: "2024-03-13",
    likes: 52,
    comments: 15
  }
];

const popularTags = [
  { name: "React", count: 125 },
  { name: "TypeScript", count: 98 },
  { name: "Web Development", count: 84 },
  { name: "UI/UX", count: 76 },
  { name: "Performance", count: 65 }
];

const Index = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => Promise.resolve(samplePosts),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content area - Posts */}
          <div className="md:col-span-8 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-24 bg-muted animate-pulse rounded-md" />
                  <div className="h-24 bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <div className="space-y-6">
                  {posts?.map((post) => (
                    <article key={post.id} className="p-4 rounded-md border bg-background/50 space-y-4">
                      <h3 className="text-lg font-medium hover:text-primary cursor-pointer transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{post.author}</span>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Widgets */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <div
                    key={tag.name}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {tag.name} ({tag.count})
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Site Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">5,678</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Comments</span>
                  <span className="font-medium">9,012</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Top Contributors</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sarah Johnson</span>
                  <span className="text-xs text-muted-foreground">142 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Michael Chen</span>
                  <span className="text-xs text-muted-foreground">98 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alex Rivera</span>
                  <span className="text-xs text-muted-foreground">76 posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
