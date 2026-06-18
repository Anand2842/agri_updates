"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CalendarPost {
  id: string;
  title: string;
  category: string;
  slug: string;
  scheduled_for: string;
}

const categoryColors: Record<string, string> = {
  Jobs: "bg-green-100 text-green-800 border-green-200",
  Research: "bg-blue-100 text-blue-800 border-blue-200",
  Startups: "bg-purple-100 text-purple-800 border-purple-200",
  Grants: "bg-amber-100 text-amber-800 border-amber-200",
  Warnings: "bg-red-100 text-red-800 border-red-200",
  Events: "bg-orange-100 text-orange-800 border-orange-200",
  Policy: "bg-rose-100 text-rose-800 border-rose-200",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const supabase = createClient();

      const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const endOfMonth = new Date(
        currentYear,
        currentMonth + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const { data } = await supabase
        .from("posts")
        .select("id, title, category, slug, scheduled_for")
        .eq("status", "scheduled")
        .gte("scheduled_for", startOfMonth)
        .lte("scheduled_for", endOfMonth)
        .order("scheduled_for", { ascending: true });

      setPosts((data as CalendarPost[]) || []);
      setLoading(false);
    }
    fetchPosts();
  }, [currentMonth, currentYear]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = today.getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const postsByDate: Record<number, CalendarPost[]> = {};
  posts.forEach((post) => {
    const d = new Date(post.scheduled_for);
    const day = d.getDate();
    if (!postsByDate[day]) postsByDate[day] = [];
    postsByDate[day].push(post);
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-1">
            Content Calendar
          </h1>
          <p className="text-stone-500 text-sm">
            View scheduled posts by date
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-serif text-lg font-bold min-w-[180px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-stone-100">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-stone-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const isToday = isCurrentMonth && day === todayDate;
            const dayPosts = day ? postsByDate[day] || [] : [];

            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r border-stone-100 p-2 ${
                  day ? "" : "bg-stone-50/50"
                } ${isToday ? "ring-2 ring-agri-green ring-inset" : ""}`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-bold mb-1 ${
                        isToday
                          ? "bg-agri-green text-white w-6 h-6 rounded-full flex items-center justify-center"
                          : "text-stone-700"
                      }`}
                    >
                      {day}
                    </div>
                    {loading ? (
                      <div className="space-y-1">
                        <div className="h-5 bg-stone-100 rounded animate-pulse" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {dayPosts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/admin/posts/${post.id}`}
                            className={`block text-[11px] font-medium px-1.5 py-0.5 rounded border truncate ${categoryColors[post.category] || "bg-stone-100 text-stone-700 border-stone-200"}`}
                            title={post.title}
                          >
                            {post.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryColors).map(([cat, cls]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className={`w-3 h-3 rounded-sm border ${cls}`} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}
