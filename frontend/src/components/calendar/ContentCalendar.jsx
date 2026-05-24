import React from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday
} from "date-fns";
import CalendarDayCell from "./CalendarDayCell";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar({ posts = [], month, onAddPost, onEditPost }) {
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const paddingCells = Array(getDay(firstDay)).fill(null);

  function getPostsForDay(day) {
    return posts.filter((post) => {
      if (!post.scheduled_at) return false;
      return isSameDay(new Date(post.scheduled_at), day);
    });
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
            onAddPost={onAddPost}
            onEditPost={onEditPost}
          />
        ))}
      </div>
    </div>
  );
}
