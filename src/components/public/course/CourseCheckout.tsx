import React, { useState, useEffect } from "react";
import { ArrowLeft, Lock, Check, Shield, Star, Users, Clock, BookOpen } from "lucide-react";

interface CourseCheckoutProps {
  slug?: string;
}

export default function CourseCheckout({ slug }: CourseCheckoutProps) {
  const navigate = (path: string) => { window.location.pathname = path; };
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/courses/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.course) setCourse(data.course);
        else setError("Course not found.");
      })
      .catch(() => setError("Failed to load course."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (!user) {
        navigate(`/login?redirect=/course/${course.slug}/checkout`);
        return;
      }
      const res = await fetch(`/api/public/courses/${course.slug}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEnrolled(true);
        setTimeout(() => navigate(`/course/${course.slug}/thank-you`), 1200);
      } else {
        setError(data.error || "Enrollment failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Course not found</h1>
          <button onClick={() => navigate("/courses")} className="text-sm text-indigo-600 hover:text-indigo-700">Browse courses</button>
        </div>
      </div>
    );
  }

  if (enrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">You're enrolled!</h2>
          <p className="text-sm text-gray-500">Redirecting to your course...</p>
        </div>
      </div>
    );
  }

  const lessonCount = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const totalMin = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.reduce((s: number, l: any) => s + (l.duration_minutes || 0), 0) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate(`/course/${course.slug}`)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to course
          </button>
          <span className="text-sm font-semibold text-gray-900">Checkout</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left - Enroll form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Enroll in {course.name}</h1>
              <p className="text-sm text-gray-500 mb-6">Complete your enrollment to get started.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Secure checkout. Your information is protected.</span>
                </div>
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : course.access_type === "free" ? (
                  "Enroll Free"
                ) : (
                  `Pay $${course.price}`
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Secure</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypted</span>
              </div>
            </div>
          </div>

          {/* Right - Course summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-8">
              {course.cover_url && (
                <img src={course.cover_url} alt={course.name} className="w-full h-36 object-cover" />
              )}
              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{course.name}</h3>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    {course.average_rating > 0 ? course.average_rating.toFixed(1) : "New course"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    {course.enrolled_count > 0 ? `${course.enrolled_count.toLocaleString()} enrolled` : "Be the first"}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {lessonCount} lessons
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(totalMin / 60)}h {totalMin % 60}m
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="text-lg font-bold text-gray-900">
                      {course.access_type === "free" ? "Free" : `$${course.price}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
