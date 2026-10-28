import React from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, startOfDay
} from "date-fns";
import CalendarDayCell from "./CalendarDayCell";
import { dayKey } from "../../lib/pillars.js";
import { parseApiDate } from "../../lib/postDates.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar({
  posts = [],
  month,
  plan = { days: {}, posts: {} },
  onDayClick,
  onEditPost,
  onRemoveDate,
  onDropPost,
}) {
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const paddingCells = Array(getDay(firstDay)).fill(null);
  const today = startOfDay(new Date());

  function getPostsForDay(day) {
    return posts
      .filter((post) => {
        const d = parseApiDate(post.scheduled_at);
        return d && isSameDay(d, day);
      })
      .sort((a, b) => parseApiDate(a.scheduled_at) - parseApiDate(b.scheduled_at));
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-text-muted font-medium py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {paddingCells.map((_, i) => (
          <CalendarDayCell key={`pad-${i}`} day={null} />
        ))}

        {days.map((day) => (
          <CalendarDayCell
            key={day.toISOString()}
            day={day}
            posts={getPostsForDay(day)}
            isToday={isToday(day)}
            dayPlan={day >= today ? plan.days[dayKey(day)] : undefined}
            postPlans={plan.posts}
            onDayClick={onDayClick}
            onEditPost={onEditPost}
            onRemoveDate={onRemoveDate}
            onDropPost={onDropPost}
          />
        ))}
      </div>
    </div>
  );
}
