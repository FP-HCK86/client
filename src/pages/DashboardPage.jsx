import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Video,
  CalendarDays,
  UploadCloud,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  MoreHorizontal,
  Loader2,
  TrendingUp,
  BookOpen,
  Camera,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "../api/client";
import { fetchContentStyles } from "../api/contentStyles";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentVideos, setRecentVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosError, setVideosError] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [schedulesError, setSchedulesError] = useState(null);
  const [stats, setStats] = useState({
    totalVideos: 0,
    scheduled: 0,
    posted7d: 0,
    failed7d: 0,
    scheduleProgress: 60,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [contentStyles, setContentStyles] = useState({ loading: true, error: null, styles: [], totalPosted: 0 });

  // Fetch content style summary (Option C lightweight endpoint)
  useEffect(() => {
    let cancelled = false;
    async function loadContentStyles() {
      try {
        setContentStyles(prev => ({ ...prev, loading: true, error: null }));
        const data = await fetchContentStyles();
        if (!cancelled) {
          setContentStyles({
            loading: false,
            error: null,
            styles: data.styles || [],
            totalPosted: data.totalPosted || 0,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setContentStyles(prev => ({ ...prev, loading: false, error: err.message || 'Failed to load content styles' }));
        }
      }
    }
    loadContentStyles();
    return () => { cancelled = true; };
  }, []);

  // Fetch recent scheduled videos from API
  useEffect(() => {
    const fetchRecentVideos = async () => {
      try {
        setVideosLoading(true);
        setVideosError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/videos/recent-scheduled', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setRecentVideos(response.data.data);
          console.log('=== FRONTEND DEBUG: Found', response.data.data.length, 'scheduled videos with status');
        } else {
          console.log('=== FRONTEND DEBUG: No data in response, setting empty array');
          setRecentVideos([]);
        }
      } catch (error) {
        console.error('Error fetching recent videos:', error);
        
        // More detailed error logging
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          setVideosError(`Server error: ${error.response.data?.error || error.message}`);
        } else if (error.request) {
          console.error('Network error:', error.request);
          setVideosError('Network error: Unable to reach server');
        } else {
          console.error('Error message:', error.message);
          setVideosError(error.message || 'Failed to load recent videos');
        }
        
        // Set fallback data for demo purposes (always 3 videos to match requirements)
        console.log('Using fallback demo data with 3 videos');
        setRecentVideos([
          {
            _id: "demo-v-201",
            title: "Demo: Editing Cepat - 3 trik padat",
            daysFromNow: "1 day from now",
            duration_sec: 76,
            status: "pending",
            platform: "instagram",
            secure_url: ""
          },
          {
            _id: "demo-v-198", 
            title: "Demo: Lighting untuk konten mobile",
            daysFromNow: "2 days from now",
            duration_sec: 112,
            status: "processing",
            platform: "tiktok",
            secure_url: ""
          },
          {
            _id: "demo-v-197",
            title: "Demo: Hook 3 detik yang nempel", 
            daysFromNow: "3 days from now",
            duration_sec: 59,
            status: "pending",
            platform: "instagram",
            secure_url: ""
          },
        ]);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchRecentVideos();
  }, []);

  // Fetch upcoming schedules from API
  useEffect(() => {
    const fetchUpcomingSchedules = async () => {
      try {
        setSchedulesLoading(true);
        setSchedulesError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/schedules/upcoming', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setUpcomingSchedules(response.data.data);
          console.log('=== FRONTEND DEBUG: Found', response.data.data.length, 'upcoming schedules');
        } else {
          console.log('=== FRONTEND DEBUG: No upcoming schedules found');
          setUpcomingSchedules([]);
        }
      } catch (error) {
        console.error('Error fetching upcoming schedules:', error);
        setSchedulesError(error.message || 'Failed to load upcoming schedules');
        
        // Set fallback data for demo purposes
        setUpcomingSchedules([
          {
            id: "s-501",
            title: "IG Reels: Editing cepat",
            date: "2 hours from now",
            platform: "Instagram",
            dateBadge: "Today"
          },
          {
            id: "s-502",
            title: "TikTok: Transisi keren",
            date: "8 hours from now",
            platform: "TikTok",
            dateBadge: "Today"
          },
          {
            id: "s-503",
            title: "IG Reels: Workflow upload",
            date: "26 hours from now",
            platform: "Instagram",
            dateBadge: "Tomorrow"
          },
          {
            id: "s-504",
            title: "TikTok: Tutorial editing",
            date: "50 hours from now",
            platform: "TikTok",
            dateBadge: "25-09-2025"
          },
        ]);
      } finally {
        setSchedulesLoading(false);
      }
    };

    fetchUpcomingSchedules();
  }, []);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/schedules/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setStats(prevStats => ({
            ...prevStats,
            totalVideos: response.data.data.totalVideos,
            scheduled: response.data.data.scheduled,
            posted7d: response.data.data.posted7d,
            failed7d: response.data.data.failed7d
          }));
          console.log('=== FRONTEND DEBUG: Dashboard stats loaded:', response.data.data);
        } else {
          console.log('=== FRONTEND DEBUG: No stats data in response');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStatsError(error.message || 'Failed to load dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'posted':
        return { variant: 'default', text: 'Analyzed' };
      case 'pending':
        return { variant: 'secondary', text: 'Queued' };
      case 'processing':
        return { variant: 'secondary', text: 'Processing' };
      case 'failed':
        return { variant: 'destructive', text: 'Failed' };
      default:
        return { variant: 'secondary', text: 'Unknown' };
    }
  };

  // Navigation handlers
  const handleOpenVideo = (videoId) => {
    navigate(`/videos/${videoId}`);
  };

  const handleViewAllVideos = () => {
    navigate('/videos');
  };

  const handleOpenCalendar = () => {
    navigate('/schedules');
  };

  // Quick Actions navigation handlers
  const handleUploadAnalyze = () => {
    navigate('/canvas');
  };

  const handleOpenLibrary = () => {
    navigate('/videos');
  };

  const handleCreateSchedule = () => {
    navigate('/schedules/create');
  };

  // Header button navigation handlers
  const handleUploadVideo = () => {
    navigate('/videos/upload');
  };

  const handleCalendar = () => {
    navigate('/schedules');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="px-4 py-6 md:px-10 md:py-10 lg:px-15 lg:py-2">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Ringkasan performa, video terbaru, dan jadwal mendatang.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleUploadVideo}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Video 
            </Button>
            <Button 
              variant="outline"
              onClick={handleCalendar}
            >
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </Button>
            <Button variant="ghost">
              <MoreHorizontal className="mr-2 h-4 w-4" /> Settings
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Video className="h-5 w-5" />}
            title="Total Videos"
            value={stats.totalVideos}
            sub="semua waktu"
            isLoading={statsLoading}
            hasError={!!statsError}
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            title="Scheduled"
            value={stats.scheduled}
            sub="antrian aktif"
            isLoading={statsLoading}
            hasError={!!statsError}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Posted (7d)"
            value={stats.posted7d}
            sub="terakhir 7 hari"
            isLoading={statsLoading}
            hasError={!!statsError}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Failed (7d)"
            value={stats.failed7d}
            sub="perlu tindakan"
            isLoading={statsLoading}
            hasError={!!statsError}
          />
        </div>

        {/* Middle Row: Performance + Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Content Style Analysis</CardTitle>
              <CardDescription>
                Distribution of your posted content by active persona style.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              {contentStyles.loading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading content styles...
                </div>
              )}
              {contentStyles.error && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-xs text-red-600">
                  {contentStyles.error} (showing derived placeholders)
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(contentStyles.styles.length ? contentStyles.styles : []).map(s => {
                  const iconMap = {
                    trendy_viral: <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />,
                    educational: <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />,
                    behind_scenes: <Camera className="h-6 w-6 mx-auto mb-2 text-purple-600" />,
                    product_showcase: <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />,
                    storytelling: <BookOpen className="h-6 w-6 mx-auto mb-2 text-red-600" />,
                    tutorial: <BookOpen className="h-6 w-6 mx-auto mb-2 text-indigo-600" />,
                    entertainment: <Star className="h-6 w-6 mx-auto mb-2 text-pink-600" />,
                    inspirational: <Star className="h-6 w-6 mx-auto mb-2 text-teal-600" />,
                  };
                  const gradientMap = {
                    trendy_viral: 'from-blue-50 to-blue-100',
                    educational: 'from-green-50 to-green-100',
                    behind_scenes: 'from-purple-50 to-purple-100',
                    product_showcase: 'from-yellow-50 to-yellow-100',
                    storytelling: 'from-red-50 to-red-100',
                    tutorial: 'from-indigo-50 to-indigo-100',
                    entertainment: 'from-pink-50 to-pink-100',
                    inspirational: 'from-teal-50 to-teal-100',
                  };
                  return (
                    <div key={s.key} className={`text-center p-3 border rounded-lg bg-gradient-to-br ${gradientMap[s.key] || 'from-slate-50 to-slate-100'}`}>
                      {iconMap[s.key] || <Star className="h-6 w-6 mx-auto mb-2 text-slate-600" />}
                      <div className="text-xl font-bold text-slate-900">{s.count}</div>
                      <div className="text-xs text-slate-700 truncate">{s.label}</div>
                    </div>
                  );
                })}
                {!contentStyles.styles.length && !contentStyles.loading && !contentStyles.error && (
                  <div className="col-span-2 md:col-span-4 text-center p-4 border rounded-md text-xs text-slate-500">
                    No posted content yet for active persona.
                  </div>
                )}
              </div>
              {/* Removed weekly target & reach estimation section as requested */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Langkah cepat yang sering dipakai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full"
                onClick={handleUploadAnalyze}
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Upload & Analyze
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleOpenLibrary}
              >
                <Video className="mr-2 h-4 w-4" /> Open Library
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCreateSchedule}
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Create Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Videos + Upcoming */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Videos</CardTitle>
              <CardDescription>
                Aktivitas terbaru yang sudah diupload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading recent videos...</span>
                </div>
              ) : videosError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-sm text-red-600 text-center">
                    {videosError}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing demo data instead
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-col divide-y divide-gray-200">
                {recentVideos.length > 0 ? (
                  recentVideos.map((video, index) => {
                    const statusBadge = getStatusBadge(video.status);
                    return (
                      <div
                        key={video._id}
                        className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between ${
                          index === 0 ? 'pt-0' : ''
                        } ${
                          index === recentVideos.length - 1 ? 'pb-0' : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-12 w-20 overflow-hidden rounded-md bg-black/5 ring-1 ring-slate-200">
                            {video.secure_url ? (
                              <video
                                src={video.secure_url}
                                className="h-full w-full object-cover"
                                muted
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                              <Play className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {video.title}
                            </div>
                            <div className="text-xs text-slate-600">
                              {video.daysFromNow} · {formatDuration(video.duration_sec)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.text}
                          </Badge>
                          <Button 
                            size="sm"
                            onClick={() => handleOpenVideo(video._id)}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Video className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No scheduled videos yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Schedule your first video to see it here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                variant="ghost"
                onClick={handleViewAllVideos}
              >
                View all
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedules</CardTitle>
              <CardDescription>Posting yang akan tayang.</CardDescription>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading upcoming schedules...</span>
                </div>
              ) : schedulesError ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm text-orange-600 text-center">
                    {schedulesError}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing demo data instead
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-col gap-3">
                {upcomingSchedules.length > 0 ? (
                  upcomingSchedules.map((schedule) => (
                    <button
                      key={schedule.id}
                      className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-medium leading-5">
                          {schedule.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {schedule.date} ·{" "}
                          <span className="font-medium">{schedule.platform}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">{schedule.dateBadge}</Badge>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CalendarDays className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No upcoming schedules</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Create your first schedule to see it here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                variant="ghost"
                onClick={handleOpenCalendar}
              >
                Open Calendar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Helpers & small components ---
function StatCard({ icon, title, value, sub, isLoading, hasError }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : hasError ? (
              <span className="text-red-500">--</span>
            ) : (
              value
            )}
          </div>
          <div className="text-xs text-slate-600">
            {title} · {sub}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// (hapus helper tak terpakai untuk bersihkan ESLint)
