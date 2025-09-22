import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
// import { startOfDay, addDays, sameDay, startOfWeekMonday } from "@/lib/dateHelpers";
import { addDays, sameDay } from "@/lib/dateHelpers";
import { getMonthMatrix, getWeekRange } from "@/lib/calendarMatrix";
import { getEventsOnDate } from "@/lib/eventHelpers";
import { formatDateHead, formatDayNum, formatWeekdayShort, formatTime } from "@/lib/formatters";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useNavigate } from "react-router-dom";

export default function ScheduleCalendarPage({
  onOpenEvent,
  onCreateSchedule,
}) {
  // views: month | week | day
  const [view, setView] = useState("month");
  const { currentDate, setCurrentDate, selectedDate, setSelectedDate, gotoToday, gotoPrev, gotoNext } = useCalendarNavigation();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch schedules based on current view and date
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get("/schedules");
        setSchedules(response.data.schedules || []);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch schedules",
          variant: "destructive",
          className: "bg-gradient-to-r from-red-500 via-red-400 to-red-300 border-red-300 text-white",
        });
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user, toast]); // Fetch once on mount, or when user changes

  const events = useMemo(() => {
    return schedules
      .filter((s) => s.status !== "failed") // Exclude failed schedules
      .map((s) => {
        const start = new Date(s.scheduled_at);
        const end = new Date(start.getTime() + (s.cover_time || 900) * 1000); // Default 15 min if no cover_time
        return {
          id: s._id,
          title: s.caption || `Post to ${s.platform}`,
          platform: s.platform,
          start: start.toISOString(),
          end: end.toISOString(),
          status: s.status,
        };
      });
  }, [schedules]);

  const monthMatrix = useMemo(() => getMonthMatrix(currentDate), [currentDate]);

  const weekRange = useMemo(() => getWeekRange(currentDate), [currentDate]);

  const eventsOnDate = (date) => getEventsOnDate(date, events);

  const openEvent = (id) => {
    if (onOpenEvent) return onOpenEvent(id);
    navigate('/schedules/' + id);
  };

  const createSchedule = () => {
    if (onCreateSchedule) return onCreateSchedule();
    if (typeof window !== "undefined")
      window.location.href = "/schedule/create";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Center container with max width and auto margins */}
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <CalendarDays className="h-6 w-6" /> Schedule Calendar
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Lihat semua jadwal posting dalam tampilan bulan/minggu/hari.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={createSchedule}
              className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Schedule
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="mt-6">
          <CardContent className="p-4">
            {loading && (
              <div className="text-center py-4">Loading schedules...</div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                  onClick={() => gotoPrev(view)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[140px] sm:min-w-[180px] text-center text-sm sm:text-base font-medium">
                  {formatDateHead(currentDate)}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                  onClick={() => gotoNext(view)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="ml-2 h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                  onClick={gotoToday}
                >
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  onClick={() => setView("month")}
                  className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "outline"}
                  onClick={() => setView("week")}
                  className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                >
                  Week
                </Button>
                <Button
                  variant={view === "day" ? "default" : "outline"}
                  onClick={() => setView("day")}
                  className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                >
                  Day
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Views */}
        {view === "month" && (
          <div className="mt-4 rounded-2xl border bg-white">
            {/* Header untuk mobile - sembunyikan di desktop */}
            <div className="block md:hidden border-b p-3 text-center text-sm font-medium text-slate-600">
              {formatDateHead(currentDate)}
            </div>
            <div className="hidden md:grid md:grid-cols-7 border-b text-xs font-medium text-slate-600">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                <div key={w} className="px-3 py-2">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-px bg-slate-200">
              {monthMatrix.map((week, weekIdx) =>
                week.map((dayData, dayIdx) => {
                  if (!dayData) {
                    // Empty slot for days outside the month
                    return (
                      <div
                        key={`empty-${weekIdx}-${dayIdx}`}
                        className="bg-slate-50"
                      />
                    );
                  }

                  const { date } = dayData;
                  const dayEvents = eventsOnDate(date);
                  const isToday = sameDay(date, new Date());
                  return (
                    <div
                      key={date.toISOString()}
                      className="relative min-h-[80px] sm:min-h-[100px] md:min-h-[112px] bg-white p-2 sm:p-3"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <button
                          className={`text-sm sm:text-xs rounded-lg px-2 py-1 sm:px-1 sm:py-0.5 ${
                            isToday ? "bg-black text-white" : "text-slate-700"
                          } touch-manipulation`}
                          onClick={() => {
                            setView("day");
                            setCurrentDate(date);
                            setSelectedDate(date);
                          }}
                        >
                          {formatDayNum(date)}
                        </button>
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => openEvent(ev.id)}
                            className="cursor-pointer truncate rounded-md bg-black px-2 py-1.5 sm:py-1 text-xs sm:text-[11px] text-white hover:opacity-90 touch-manipulation"
                            title={`${ev.title} • ${formatTime(
                              ev.start
                            )}-${formatTime(ev.end)}`}
                          >
                            <span className="font-medium">{ev.title}</span>
                            <span className="ml-2 opacity-80">
                              {formatTime(ev.start)}
                            </span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <button
                            className="text-xs sm:text-[11px] text-slate-600 hover:underline touch-manipulation"
                            onClick={() => {
                              setView("day");
                              setCurrentDate(date);
                              setSelectedDate(date);
                            }}
                          >
                            +{dayEvents.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="mt-4 rounded-2xl border bg-white p-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3">
              {weekRange.map((d) => {
                const list = eventsOnDate(d);
                const isToday = sameDay(d, new Date());
                return (
                  <div
                    key={d.toISOString()}
                    className="rounded-xl border p-3 sm:p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm sm:text-xs text-slate-500 font-medium">
                        {formatWeekdayShort(d)}
                      </div>
                      <Badge
                        variant={isToday ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {formatDayNum(d)}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {list.length === 0 && (
                        <div className="rounded-lg border border-dashed p-4 sm:p-3 text-center text-sm sm:text-xs text-slate-500">
                          No events
                        </div>
                      )}
                      {list.map((ev) => (
                        <button
                          key={ev.id}
                          className="flex flex-col items-start rounded-lg border p-3 sm:p-2 text-left hover:bg-slate-50 touch-manipulation"
                          onClick={() => openEvent(ev.id)}
                        >
                          <div className="text-base sm:text-sm font-medium leading-5 line-clamp-2">
                            {ev.title}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-sm sm:text-xs text-slate-600">
                            <Clock className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                            <span>
                              {formatTime(ev.start)}–{formatTime(ev.end)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {ev.platform}
                            </Badge>
                            <Badge
                              variant={
                                ev.status === "posted"
                                  ? "default"
                                  : ev.status === "pending" || ev.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {ev.status === 'processing' ? 'processing…' : ev.status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "day" && (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Selected</div>
                    <div className="text-lg font-semibold">
                      {selectedDate.toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                      onClick={() => {
                        const d = addDays(selectedDate, -1);
                        setSelectedDate(d);
                        setCurrentDate(d);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
                      onClick={() => {
                        const d = addDays(selectedDate, 1);
                        setSelectedDate(d);
                        setCurrentDate(d);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {(() => {
                    const list = eventsOnDate(selectedDate);
                    if (list.length === 0)
                      return (
                        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                          No events on this day
                        </div>
                      );
                    return list.map((ev) => (
                      <button
                        key={ev.id}
                        className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-slate-50"
                        onClick={() => openEvent(ev.id)}
                      >
                        <div>
                          <div className="text-sm font-medium leading-5">
                            {ev.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {formatTime(ev.start)}–{formatTime(ev.end)}
                            </span>
                            <Badge variant="outline">{ev.platform}</Badge>
                            <Badge
                              variant={
                                ev.status === "posted"
                                  ? "default"
                                  : ev.status === "pending" || ev.status === 'processing'
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {ev.status === 'processing' ? 'processing…' : ev.status}
                            </Badge>
                          </div>
                        </div>
                        <Badge>
                          {selectedDate.toLocaleDateString(undefined, {
                            month: "short",
                          })}{" "}
                          {formatDayNum(selectedDate)}
                        </Badge>
                      </button>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-2">Quick Actions</div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={createSchedule}
                    className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Schedule
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setView("week");
                    }}
                    className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                  >
                    View This Week
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setView("month");
                    }}
                    className="h-10 sm:h-9 px-4 sm:px-3 touch-manipulation"
                  >
                    View This Month
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
