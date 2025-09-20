import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import AccountSettingsPage from "./pages/AccountSettingPage";
import LoginPageVisual from "./pages/LoginPageVisual";
import RegisterPageVisual from "./pages/RegisterPageVisual";
import LogoutPage from "./pages/LogoutPage";
import ScheduleCalendarPage from "./pages/ScheduleCalenderPage";
import ScheduleDetailPage from "./pages/ScheduleDetailPage";
import ScheduleCreatePage from "./pages/SecheduleCreatePage";
import VideoDetailPage from "./pages/VideoDetailPage";
import VideoLibraryPage from "./pages/VideoLibraryPage";
import CanvasPage from "./pages/CanvasPage";
import SidebarLayout from "./layout/SidebarLayout";
import DashboardPage from "./pages/DashboardPage";
import HeroSection from "./pages/LandingPage";
import { Toaster } from "@/components/ui/toaster";
import VideoUploadPage from "./pages/VideUploadPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPageVisual />} />
          <Route path="/register" element={<RegisterPageVisual />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/" element={<HeroSection />} />
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schedules" element={<ScheduleCalendarPage />} />
            <Route path="/schedules/create" element={<ScheduleCreatePage />} />
            <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
            <Route path="/videos" element={<VideoLibraryPage />} />
            <Route path="/videos/upload" element={<VideoUploadPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/videos/:id" element={<VideoDetailPage />} />
            <Route path="/account" element={<AccountSettingsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
