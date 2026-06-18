import React, { useState, useEffect } from "react";
import { Check, ChevronDown, Star, Users, Clock, BookOpen, Play, Shield, Award, ArrowRight, Sparkles } from "lucide-react";
import TestimonialCard from "../shared/TestimonialCard";
import FaqSection from "../shared/FaqSection";

interface CourseLandingPageProps {
  slug?: string;
}

export default function CourseLandingPage({ slug }: CourseLandingPageProps) {
  const navigate = (path: string) => { window.location.pathname = path; };
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/public/courses/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          document.title = data.course.seo_title || `${data.course.name} - Online Course`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (data.course.seo_description && metaDesc) metaDesc.setAttribute("content", data.course.seo_description);
        } else {
          setError("Course not found.");
        }
      })
      .catch(() => setError("Failed to load course."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error || "Course not found"}</h1>
          <p className="text-sm text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/courses")} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Browse courses <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    navigate(`/course/${course.slug}/checkout`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO meta */}
      {course.meta_image && (
        <link rel="preload" as="image" href={course.meta_image} />
      )}

      {/* ──────── HERO ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              {course.difficulty_level && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-300 bg-white/10 px-3 py-1 rounded-full mb-4">
                  <Sparkles className="w-3 h-3" />
                  {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">{course.name}</h1>
              {course.subtitle && <p className="text-lg md:text-xl text-gray-300 mb-6">{course.subtitle}</p>}
              <p className="text-sm text-gray-400 leading-relaxed mb-8">{course.description}</p>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-8">
                {course.creator_avatar ? (
                  <img src={course.creator_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{(course.creator_name || "I").charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{course.creator_name || "Instructor"}</p>
                  <p className="text-xs text-gray-400">Course Instructor</p>
                </div>
              </div>

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-5 mb-8">
                <span className="flex items-center gap-1.5 text-sm text-gray-300">
                  <Star className="w-4 h-4 text-amber-400" />
                  {course.average_rating > 0 ? course.average_rating.toFixed(1) : "New"}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-gray-300">
                  <Users className="w-4 h-4" />
                  {course.enrolled_count > 0 ? `${course.enrolled_count.toLocaleString()} enrolled` : "Be the first"}
                </span>
                {course.estimated_hours > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Clock className="w-4 h-4" />
                    {course.estimated_hours} hours
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleEnroll}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {course.access_type === "free" ? "Enroll Free" : `Enroll Now - $${course.price}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors">
                  <Play className="w-4 h-4" />
                  Watch Preview
                </button>
              </div>
            </div>

            {/* Right - Cover image */}
            <div className="hidden md:block">
              {course.cover_url ? (
                <img src={course.cover_url} alt={course.name} className="w-full rounded-2xl shadow-2xl" />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl flex items-center justify-center border border-white/10">
                  <BookOpen className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── WHAT YOU'LL LEARN ──────── */}
      {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-8 text-center">What You'll Learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.what_you_will_learn.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────── BENEFITS ──────── */}
      {course.benefits && course.benefits.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3 text-center">Why Take This Course</h2>
            <p className="text-gray-500 text-center mb-10 max-w-2xl mx-auto">Everything you need to succeed</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.benefits.map((benefit: string, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{benefit}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────── CURRICULUM PREVIEW ──────── */}
      {course.modules && course.modules.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">Course Curriculum</h2>
              <p className="text-gray-500">{course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)} lessons across {course.modules.length} modules</p>
            </div>
            <div className="space-y-3">
              {course.modules.map((mod: any, i: number) => {
                const isOpen = expandedModule === i;
                const lessonCount = mod.lessons?.length || 0;
                const totalMin = mod.lessons?.reduce((s: number, l: any) => s + (l.duration_minutes || 0), 0) || 0;
                return (
                  <div key={mod.id || i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedModule(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {i + 1}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{mod.title}</span>
                          <span className="text-xs text-gray-500 ml-2">{lessonCount} lessons &middot; {Math.floor(totalMin / 60)}h {totalMin % 60}m</span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 border-t border-gray-100">
                        {mod.description && <p className="text-xs text-gray-500 mt-3 mb-2">{mod.description}</p>}
                        {mod.lessons && mod.lessons.length > 0 && (
                          <ul className="space-y-1">
                            {mod.lessons.map((lesson: any, li: number) => (
                              <li key={lesson.id || li} className="flex items-center justify-between py-1.5">
                                <div className="flex items-center gap-2">
                                  {lesson.is_free_preview ? (
                                    <Play className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                  <span className="text-sm text-gray-700">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lesson.is_free_preview && (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Free</span>
                                  )}
                                  <span className="text-xs text-gray-400">{lesson.duration_minutes || 0}m</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ──────── TESTIMONIALS ──────── */}
      {course.testimonials && course.testimonials.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">What Students Say</h2>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-sm text-gray-500 ml-2">{course.average_rating > 0 ? course.average_rating.toFixed(1) : "4.8"} average rating</span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.testimonials.map((t: any, i: number) => (
                <TestimonialCard key={i} name={t.name} role={t.role} content={t.content} rating={t.rating} avatar={t.avatar} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────── FAQ ──────── */}
      {course.faq && course.faq.length > 0 && (
        <FaqSection items={course.faq} title="Frequently Asked Questions" />
      )}

      {/* ──────── FINAL CTA ──────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Join {course.enrolled_count > 0 ? `${course.enrolled_count.toLocaleString()} students` : "learners"} who are already taking this course.</p>
          <button
            onClick={handleEnroll}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors"
          >
            {course.access_type === "free" ? "Enroll Free" : `Enroll Now - $${course.price}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
