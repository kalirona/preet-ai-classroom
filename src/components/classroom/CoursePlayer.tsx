import React, { useState, useEffect } from "react";
import {
  BookOpen, PlayCircle, CheckCircle, Lock, Download, Award, Flame,
  ChevronRight, FileText, PenTool, ClipboardList, MessageSquare,
  X, RefreshCw
} from "lucide-react";
import { Course, Lesson, Comment } from "../../types";

interface CoursePlayerProps {
  course: Course;
  courses: Course[];
  currentUser: any;
  onBack: () => void;
  onSelectCourse: (course: Course) => void;
}

export default function CoursePlayer({ course, courses, currentUser, onBack, onSelectCourse }: CoursePlayerProps) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    course.modules?.[0]?.lessons?.[0] || null
  );
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState("");
  const [activeLessonDetails, setActiveLessonDetails] = useState<Lesson | null>(null);

  // Quiz
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Assignment
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentSubmission, setAssignmentSubmission] = useState<any>(null);

  // Discussion
  const [lessonComments, setLessonComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");

  const userStreak = currentUser?.streak || 5;
  const userLevel = currentUser?.level || 1;
  const userXp = currentUser?.xp || 0;

  useEffect(() => {
    if (activeLesson) setActiveLessonDetails(activeLesson);
  }, [activeLesson]);

  useEffect(() => {
    if (currentUser?.id && activeLesson?.id) {
      const saved = localStorage.getItem(`/classroom/notes/${currentUser.id}/${activeLesson.id}`);
      setActiveNotes(saved || "");
    } else {
      setActiveNotes("");
    }
  }, [currentUser, activeLesson]);

  const getCourseProgress = (c: Course): number => {
    if (!c.modules) return 0;
    const all = c.modules.flatMap(m => m.lessons || []);
    if (all.length === 0) return 0;
    return Math.round((all.filter(l => completedLessons.includes(l.id)).length / all.length) * 100);
  };

  const progressPercent = getCourseProgress(course);

  const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
  const completedInCourse = allLessons.filter(l => completedLessons.includes(l.id));

  const handleToggleCompleted = (lessonId: string) => {
    setCompletedLessons(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handlePrevLesson = () => {
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) setActiveLesson(allLessons[idx - 1]);
  };

  const handleNextLesson = () => {
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1]);
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    const correct = activeLessonDetails?.quizQuestions?.filter((q, i) => quizSelectedAnswers[i] === q.answerIndex).length || 0;
    setQuizResults({ correct, total: activeLessonDetails?.quizQuestions?.length || 0 });
    if (!completedLessons.includes(activeLessonDetails?.id || "")) {
      handleToggleCompleted(activeLessonDetails?.id || "");
    }
  };

  const handleSaveNotes = (text: string) => {
    setActiveNotes(text);
    if (currentUser?.id && activeLesson?.id) {
      localStorage.setItem(`/classroom/notes/${currentUser.id}/${activeLesson.id}`, text);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top nav */}
      <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
        <button onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
          &larr; Back to courses
        </button>
        <h3 className="text-sm font-semibold text-gray-800 truncate max-w-sm">{course.name}</h3>
      </div>

      {/* Progress header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 text-white flex flex-col md:flex-row p-5 rounded-2xl items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-orange-400">{userStreak} Day Streak</span>
            <p className="text-sm text-gray-400">Level {userLevel} &middot; {userXp} XP</p>
          </div>
        </div>
        <div className="flex-1 max-w-xs w-full">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Course Progress</span>
            <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-gray-400 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="grid grid-cols-12 gap-5 items-start">
        {/* Left: Course Index */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm max-h-[85vh] overflow-y-auto space-y-6">
          {/* Course switcher */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Courses</span>
            <div className="space-y-1">
              {courses.map(c => (
                <button key={c.id} onClick={() => onSelectCourse(c)}
                  className={`w-full text-left py-2 px-2.5 rounded-xl text-sm font-medium transition ${
                    course.id === c.id ? "bg-gray-900 text-white font-semibold" : "hover:bg-gray-50 text-gray-600"
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-2.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Completed</span>
                <span className="text-emerald-600 font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm pt-1">
              <div className="bg-white border border-gray-100 rounded-lg p-2 text-center">
                <span className="text-gray-400 block text-xs">Streak</span>
                <span className="font-semibold text-orange-600">{userStreak} days</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-2 text-center">
                <span className="text-gray-400 block text-xs">Level</span>
                <span className="font-semibold text-gray-900">{userLevel}</span>
              </div>
            </div>
          </div>

          {/* Continue */}
          {(() => {
            const nextLesson = allLessons.find(l => !completedLessons.includes(l.id));
            if (!nextLesson) return (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center text-sm text-emerald-800 font-semibold">Course completed!</div>
            );
            return (
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl space-y-2">
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Continue</span>
                <h5 className="text-sm font-medium text-gray-900 truncate">{nextLesson.title}</h5>
                <button onClick={() => setActiveLesson(nextLesson)}
                  className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition">Resume</button>
              </div>
            );
          })()}

          {/* Curriculum tree */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curriculum</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                {completedInCourse.length}/{allLessons.length}
              </span>
            </div>
            {course.modules?.map((mod, i) => (
              <div key={mod.id} className="space-y-1">
                <div className="font-medium text-gray-900 text-sm flex items-center gap-1 border-b border-gray-100 pb-1">
                  <span className="w-2 h-2 rounded-sm bg-gray-900 shrink-0" />
                  <span className="truncate">Module {i + 1}: {mod.title}</span>
                </div>
                <div className="pl-3 border-l border-gray-100 space-y-0.5">
                  {mod.lessons?.map(ls => {
                    const isActive = activeLesson?.id === ls.id;
                    const isDone = completedLessons.includes(ls.id);
                    return (
                      <button key={ls.id} onClick={() => setActiveLesson(ls)}
                        className={`w-full text-left py-1.5 px-2 rounded-xl text-sm flex items-center justify-between gap-2 transition ${
                          isActive ? "bg-gray-900 text-white font-medium" : "hover:bg-gray-50 text-gray-600"
                        }`}>
                        <span className="truncate flex items-center gap-1.5">
                          {ls.isLocked ? <Lock className="w-3 h-3" /> : isDone ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          <span className="truncate">{ls.title}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize shrink-0">{ls.contentType}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Lesson Content */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          <div className="bg-gray-950 aspect-video rounded-2xl overflow-hidden relative border border-gray-800">
            {activeLessonDetails ? (
              activeLessonDetails.isLocked ? (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-8 text-center text-white">
                  <div>
                    <Lock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-amber-400">Lesson Locked</h4>
                    <p className="text-sm text-gray-400 mt-1">Complete previous lessons to unlock.</p>
                  </div>
                </div>
              ) : activeLessonDetails.contentType === "video" && activeLessonDetails.videoUrl ? (
                activeLessonDetails.videoUrl.includes("youtube.com") || activeLessonDetails.videoUrl.includes("embed") ? (
                  <iframe src={activeLessonDetails.videoUrl} title="Lesson Video" className="w-full h-full border-0" allowFullScreen />
                ) : (
                  <video src={activeLessonDetails.videoUrl} controls className="w-full h-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col justify-center items-center p-6 text-center text-white">
                  {activeLessonDetails.contentType === "quiz" ? (
                    <><ClipboardList className="w-12 h-12 text-gray-400 mb-3" /><h4 className="text-sm font-semibold">Quiz</h4><p className="text-sm text-gray-400 mt-1">Answer the questions below.</p></>
                  ) : activeLessonDetails.contentType === "assignment" ? (
                    <><PenTool className="w-12 h-12 text-gray-400 mb-3" /><h4 className="text-sm font-semibold">Assignment</h4><p className="text-sm text-gray-400 mt-1">Complete the assignment below.</p></>
                  ) : (
                    <><FileText className="w-12 h-12 text-gray-400 mb-3" /><h4 className="text-sm font-semibold">Lesson Content</h4></>
                  )}
                </div>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <PlayCircle className="w-12 h-12 text-gray-700" />
              </div>
            )}
          </div>

          {/* Lesson details */}
          {activeLessonDetails && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">Lesson {(allLessons.findIndex(l => l.id === activeLessonDetails.id)) + 1}</span>
                    <span className="text-xs text-gray-400">{activeLessonDetails.durationMinutes} min</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mt-1">{activeLessonDetails.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrevLesson} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Prev</button>
                  <button onClick={() => handleToggleCompleted(activeLessonDetails.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                      completedLessons.includes(activeLessonDetails.id) ? "bg-emerald-100 text-emerald-700" : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}>
                    {completedLessons.includes(activeLessonDetails.id) ? "Completed" : "Mark Complete"}
                  </button>
                  <button onClick={handleNextLesson} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Next</button>
                </div>
              </div>

              {/* Text content */}
              {activeLessonDetails.textContent && (
                <div className="prose prose-sm max-w-none">
                  {activeLessonDetails.textContent.split("\n\n").map((block, i) => {
                    if (block.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">{block.slice(3)}</h2>;
                    if (block.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{block.slice(2)}</h1>;
                    if (block.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-gray-300 pl-4 py-2 text-gray-600 italic">{block.slice(2)}</blockquote>;
                    if (block.startsWith("- ") || block.startsWith("* ")) return <li key={i} className="text-sm text-gray-700 ml-4">{block.slice(2)}</li>;
                    if (block.startsWith("```")) return <pre key={i} className="bg-gray-50 rounded-lg p-4 text-sm font-mono overflow-x-auto">{block.replace(/```\w*/g, "").trim()}</pre>;
                    if (block === "---") return <hr key={i} className="border-gray-200 my-4" />;
                    return <p key={i} className="text-sm text-gray-700 leading-relaxed">{block}</p>;
                  })}
                </div>
              )}

              {/* Quiz */}
              {activeLessonDetails.contentType === "quiz" && activeLessonDetails.quizQuestions && activeLessonDetails.quizQuestions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Quiz</h4>
                  {!quizSubmitted ? (
                    <>
                      {activeLessonDetails.quizQuestions.map((q, qi) => (
                        <div key={qi} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                          <p className="text-sm font-medium text-gray-900">{qi + 1}. {q.question}</p>
                          <div className="space-y-1">
                            {q.options.map((opt, oi) => (
                              <button key={oi} onClick={() => setQuizSelectedAnswers(prev => ({ ...prev, [qi]: oi }))}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition ${
                                  quizSelectedAnswers[qi] === oi ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                                }`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button onClick={handleSubmitQuiz} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition">Submit Quiz</button>
                    </>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-800">Score: {quizResults?.correct || 0}/{quizResults?.total || 0}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment */}
              {activeLessonDetails.contentType === "assignment" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Assignment</h4>
                  {activeLessonDetails.assignmentInstructions && (
                    <p className="text-sm text-gray-700">{activeLessonDetails.assignmentInstructions}</p>
                  )}
                  {!assignmentSubmission ? (
                    <>
                      <textarea value={assignmentText} onChange={e => setAssignmentText(e.target.value)}
                        rows={4} placeholder="Write your assignment here..."
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
                      <button onClick={() => { setAssignmentSubmission({ text: assignmentText }); handleToggleCompleted(activeLessonDetails.id); }}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition">Submit Assignment</button>
                    </>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold text-emerald-800">Assignment submitted!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Discussions & Notes */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm max-h-[85vh] overflow-y-auto space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Discussion
            </h4>
            <div className="space-y-2">
              <textarea value={newCommentText} onChange={e => setNewCommentText(e.target.value)}
                rows={2} placeholder="Add a comment..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
              <button onClick={() => { if (newCommentText.trim()) { setLessonComments(prev => [...prev, { id: `c${Date.now()}`, authorName: currentUser?.name || "You", content: newCommentText, createdAt: new Date().toISOString(), lessonId: activeLesson?.id || "", likes: 0 } as Comment]); setNewCommentText(""); } }}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition">Post</button>
            </div>
            {lessonComments.length === 0 ? (
              <p className="text-xs text-gray-400">No comments yet. Start the discussion!</p>
            ) : (
              <div className="space-y-2">
                {lessonComments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h4>
            <textarea value={activeNotes} onChange={e => handleSaveNotes(e.target.value)}
              rows={6} placeholder="Take notes for this lesson..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
            <p className="text-[10px] text-gray-400">Notes saved automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
