import React, { useState } from "react";
import {
  BookOpen, Award, Flame, GraduationCap, ChevronRight,
  Clock, Users, CheckCircle, PlayCircle, Sparkles
} from "lucide-react";
import { Course } from "../../types";
import CoursePlayer from "./CoursePlayer";

interface ClassroomViewProps {
  currentUser: any;
  activeCommunity: any;
  courses: Course[];
}

type ClassroomTab = "continue" | "my-courses" | "upcoming" | "certificates";

export default function ClassroomView({ currentUser, activeCommunity, courses }: ClassroomViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<ClassroomTab>("continue");
  const [completedLessons] = useState<string[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);

  const userStreak = currentUser?.streak || 5;
  const userLevel = currentUser?.level || 1;
  const userXp = currentUser?.xp || 0;

  const getCourseProgress = (course: Course): number => {
    if (!course.modules) return 0;
    const all = course.modules.flatMap(m => m.lessons || []);
    if (all.length === 0) return 0;
    return Math.round((all.filter(l => completedLessons.includes(l.id)).length / all.length) * 100);
  };

  const getContinueTarget = () => {
    for (const course of courses) {
      for (const mod of course.modules || []) {
        for (const lesson of mod.lessons || []) {
          if (!completedLessons.includes(lesson.id)) {
            return { course, nextLesson: lesson };
          }
        }
      }
    }
    return null;
  };

  const completedCourses = courses.filter(c => getCourseProgress(c) === 100);

  const liveSessions = [
    { id: "live_1", title: "Weekly SaaS Architecture AMA", host: "Alex Rivera", date: "Today at 7:00 PM", desc: "Live code walkthrough & Q&A", attendees: 18, isLiveSoon: true },
    { id: "live_2", title: "Database Tuning & Performance", host: "Sarah Connor", date: "Jun 22, 2026", desc: "Handle scale spikes & avoid leaks", attendees: 31, isLiveSoon: false },
  ];

  const tabs: { id: ClassroomTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "continue", label: "Continue Learning", icon: PlayCircle },
    { id: "my-courses", label: "My Courses", icon: BookOpen, count: courses.length },
    { id: "upcoming", label: "Upcoming Sessions", icon: Clock },
    { id: "certificates", label: "Certificates", icon: Award, count: completedCourses.length },
  ];

  if (selectedCourse) {
    return (
      <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <CoursePlayer
          course={selectedCourse}
          courses={courses}
          currentUser={currentUser}
          onBack={() => setSelectedCourse(null)}
          onSelectCourse={setSelectedCourse}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full ml-1">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue Learning */}
      {activeTab === "continue" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {(() => {
              const target = getContinueTarget();
              if (!target) {
                return (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <GraduationCap className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-base font-semibold text-gray-700">All caught up!</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">You've completed all available course content. Check back for new courses.</p>
                  </div>
                );
              }
              const progress = getCourseProgress(target.course);
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-5 items-center hover:border-gray-300 transition">
                  <div className="w-full md:w-36 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={target.course.coverUrl || ""} alt={target.course.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3 w-full">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Continue Learning</span>
                      <h3 className="text-base font-semibold text-gray-900 truncate mt-0.5">{target.course.name}</h3>
                      {target.nextLesson && (
                        <p className="text-sm text-gray-500 mt-0.5">Left off: <span className="font-medium">{target.nextLesson.title}</span></p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Progress</span>
                        <span className="font-semibold text-gray-700">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <button onClick={() => setSelectedCourse(target.course)}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition">
                      Resume
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Quick course progress list */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">My Courses</h3>
              {courses.length === 0 ? (
                <p className="text-sm text-gray-400">No courses available.</p>
              ) : (
                <div className="space-y-2">
                  {courses.slice(0, 5).map(course => {
                    const progress = getCourseProgress(course);
                    return (
                      <div key={course.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                          <p className="text-xs text-gray-500">{course.modules?.length || 0} modules</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <button onClick={() => setSelectedCourse(course)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition">
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {courses.length > 5 && (
                    <button onClick={() => setActiveTab("my-courses")}
                      className="text-sm font-medium text-gray-500 hover:text-gray-900 pt-2 block">
                      View all {courses.length} courses &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Streak */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Award className="w-16 h-16" />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Learning Streak</span>
              <h4 className="text-lg font-bold">Keep it going!</h4>
              <p className="text-sm text-gray-400">Complete lessons daily to earn XP.</p>
              <div className="flex items-center gap-3 pt-1">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-lg font-bold text-amber-400">{userStreak} day streak</span>
              </div>
              <div className="text-sm text-gray-400">Level {userLevel} &middot; {userXp} XP</div>
            </div>

            {/* Upcoming quick */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Sessions</h3>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              {liveSessions.slice(0, 2).map(session => {
                const isRSVPd = rsvps[session.id] === true;
                return (
                  <div key={session.id} className="bg-gray-50 border border-gray-100 p-3 rounded-xl space-y-2 relative">
                    {session.isLiveSoon && <span className="absolute top-2 right-2 text-xs font-medium text-rose-600">LIVE</span>}
                    <h4 className="text-sm font-medium text-gray-900">{session.title}</h4>
                    <p className="text-xs text-gray-500">{session.date}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-xs text-gray-400">{session.attendees + (isRSVPd ? 1 : 0)} attending</span>
                      <button onClick={() => setRsvps(prev => ({ ...prev, [session.id]: !isRSVPd }))}
                        className={`px-2 py-0.5 text-xs font-medium rounded-lg border transition ${
                          isRSVPd ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                        }`}>
                        {isRSVPd ? "Attending" : "RSVP"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* My Courses */}
      {activeTab === "my-courses" && (
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-700">No courses yet</h4>
              <p className="text-sm text-gray-400 mt-1">Courses will appear here once you're enrolled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col group">
                  <div className="h-40 bg-gray-100 relative overflow-hidden shrink-0">
                    {course.coverUrl && (
                      <img src={course.coverUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white flex gap-1.5 items-center z-10">
                      <span className="text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
                        {course.modules?.length || 0} modules
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        getCourseProgress(course) === 100
                          ? "bg-emerald-500 text-white"
                          : getCourseProgress(course) > 0
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500/70 text-white"
                      }`}>
                        {getCourseProgress(course)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-semibold text-gray-900">{course.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-400">{course.enrolledCount || 0} students</span>
                      <button onClick={() => setSelectedCourse(course)}
                        className="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white transition flex items-center gap-1">
                        Open <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Sessions */}
      {activeTab === "upcoming" && (
        <div className="max-w-2xl space-y-4">
          {liveSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-700">No upcoming sessions</h4>
              <p className="text-sm text-gray-400 mt-1">Check back later for scheduled live sessions.</p>
            </div>
          ) : (
            liveSessions.map(session => {
              const isRSVPd = rsvps[session.id] === true;
              return (
                <div key={session.id} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">{session.title}</h4>
                        {session.isLiveSoon && (
                          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">LIVE</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Hosted by {session.host}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{session.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{session.date}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{session.attendees + (isRSVPd ? 1 : 0)} attending</span>
                    </div>
                    <button onClick={() => setRsvps(prev => ({ ...prev, [session.id]: !isRSVPd }))}
                      className={`px-4 py-2 text-sm font-medium rounded-xl border transition ${
                        isRSVPd ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}>
                      {isRSVPd ? "Attending" : "RSVP"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Certificates */}
      {activeTab === "certificates" && (
        <div className="max-w-3xl space-y-4">
          {completedCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-gray-700">No certificates yet</h4>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">Complete a course to earn your certificate of completion.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedCourses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-amber-200 p-5 space-y-3 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Completed</span>
                  </div>
                  <h4 className="text-base font-semibold text-gray-900">{course.name}</h4>
                  <p className="text-sm text-gray-500">{course.modules?.length || 0} modules</p>
                  <button onClick={() => { setCertificateCourse(course); setCertificateModalOpen(true); }}
                    className="px-4 py-2 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 text-sm font-medium rounded-xl transition">
                    View Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {certificateModalOpen && certificateCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-2xl max-w-md w-full space-y-5 text-center">
            <Award className="w-16 h-16 text-amber-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Certificate of Completion</h3>
            <p className="text-sm text-gray-500">This certifies that you have completed</p>
            <p className="text-lg font-bold text-gray-900">{certificateCourse.name}</p>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-400">Issued on {new Date().toLocaleDateString()}</p>
            </div>
            <button onClick={() => setCertificateModalOpen(false)}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
