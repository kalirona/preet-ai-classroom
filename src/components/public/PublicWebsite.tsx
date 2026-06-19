import React, { useState, useEffect } from "react";
import PublicHeader from "./layout/PublicHeader";
import PublicFooter from "./layout/PublicFooter";
import HomePage from "./home/HomePage";
import FeaturesPage from "./home/FeaturesPage";
import PricingPage from "./home/PricingPage";
import BlogPage from "./home/BlogPage";
import AboutPage from "./home/AboutPage";
import ContactPage from "./home/ContactPage";
import AuthPage from "./auth/AuthPage";
import CommunityLandingPage from "./community/CommunityLandingPage";
import CommunitiesDirectory from "./community/CommunitiesDirectory";
import CourseLandingPage from "./course/CourseLandingPage";
import CourseCheckout from "./course/CourseCheckout";
import CourseThankYou from "./course/CourseThankYou";
import CoursesDirectory from "./course/CoursesDirectory";
import CreatorLandingPage from "./creator/CreatorLandingPage";
import WebsiteBuilder from "./builder/WebsiteBuilder";

interface PublicWebsiteProps {
  onAuthSuccess?: (user: any) => void;
}

function CoursePreview({ id }: { id: string }) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.course) {
          setCourse(data.course);
          // Redirect to slug-based URL if available
          if (data.course.slug) {
            window.location.replace(`/course/${data.course.slug}`);
            return;
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;
  }

  if (!course) {
    return <div className="flex items-center justify-center min-h-screen text-slate-500">Course not found.</div>;
  }

  return <CourseLandingPage slug={course.slug || course.id} />;
}

export default function PublicWebsite({ onAuthSuccess }: PublicWebsiteProps) {
  const [route, setRoute] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;

      // Dynamic routes
      const communityMatch = path.match(/^\/community\/(.+)$/);
      const courseCheckoutMatch = path.match(/^\/course\/([^/]+)\/checkout$/);
      const courseThankYouMatch = path.match(/^\/course\/([^/]+)\/thank-you$/);
      const courseMatch = path.match(/^\/course\/([^/]+)$/);
      const coursePreviewMatch = path.match(/^\/preview\/course\/([^/]+)$/);
      const creatorMatch = path.match(/^\/creator\/(.+)$/);
      const blogPostMatch = path.match(/^\/blog\/(.+)$/);

      if (path === "/" || path === "") setRoute("home");
      else if (path === "/features") setRoute("features");
      else if (path === "/pricing") setRoute("pricing");
      else if (path === "/communities") setRoute("communities");
      else if (path === "/courses") setRoute("courses");
      else if (path === "/blog") setRoute("blog");
      else if (path === "/about") setRoute("about");
      else if (path === "/contact") setRoute("contact");
      else if (path === "/faq") setRoute("faq");
      else if (path === "/login") setRoute("login");
      else if (path === "/register") setRoute("register");
      else if (path === "/builder") setRoute("builder");
      else if (communityMatch) { setRoute("community"); setParams({ slug: communityMatch[1] }); }
      else if (courseCheckoutMatch) { setRoute("course-checkout"); setParams({ slug: courseCheckoutMatch[1] }); }
      else if (courseThankYouMatch) { setRoute("course-thank-you"); setParams({ slug: courseThankYouMatch[1] }); }
      else if (courseMatch) { setRoute("course"); setParams({ slug: courseMatch[1] }); }
      else if (coursePreviewMatch) { setRoute("preview-course"); setParams({ id: coursePreviewMatch[1] }); }
      else if (creatorMatch) { setRoute("creator"); setParams({ username: creatorMatch[1] }); }
      else if (blogPostMatch) { setRoute("blog-post"); setParams({ slug: blogPostMatch[1] }); }
      else setRoute("home");
    };

    handleRoute();
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  // Auth pages don't show header/footer
  const isAuthPage = route === "login" || route === "register";
  const isBuilderPage = route === "builder";

  const renderPage = () => {
    switch (route) {
      case "features": return <FeaturesPage />;
      case "pricing": return <PricingPage />;
      case "communities": return <CommunitiesDirectory />;
      case "courses": return <CoursesDirectory />;
      case "blog": return <BlogPage />;
      case "about": return <AboutPage />;
      case "contact": return <ContactPage />;
      case "faq": return <HomePage />;
      case "community": return <CommunityLandingPage slug={params.slug} />;
      case "course": return <CourseLandingPage slug={params.slug} />;
      case "preview-course": return <CoursePreview id={params.id} />;
      case "course-checkout": return <CourseCheckout slug={params.slug} />;
      case "course-thank-you": return <CourseThankYou slug={params.slug} />;
      case "creator": return <CreatorLandingPage username={params.username} />;
      case "blog-post": return <BlogPage />;
      case "builder": return <WebsiteBuilder />;
      case "login": return <AuthPage initialMode="login" onAuthSuccess={onAuthSuccess} />;
      case "register": return <AuthPage initialMode="register" onAuthSuccess={onAuthSuccess} />;
      default: return <HomePage />;
    }
  };

  if (isAuthPage || isBuilderPage) {
    return <>{renderPage()}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="pt-16">
        {renderPage()}
      </main>
      <PublicFooter />
    </div>
  );
}
