import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AccountSettingsPage from "./pages/AccountSettingPage";
import LoginPageVisual from "./pages/LoginPageVisual";
import ScheduleCalendarPage from "./pages/ScheduleCalenderPage";
import ScheduleDetailPage from "./pages/ScheduleDetailPage";
import ScheduleCreatePage from "./pages/SecheduleCreatePage";
import VideoDetailPage from "./pages/VideoDetailPage";
import VideoLibraryPage from "./pages/VideoLibraryPage";
import CanvasPage from "./pages/CanvasPage";
import SidebarLayout from "./layout/SidebarLayout";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPageVisual />} />
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/schedules" element={<ScheduleCalendarPage />} />
          <Route path="/schedules/create" element={<ScheduleCreatePage />} />
          <Route path="/schedules/:id" element={<ScheduleDetailPage />} />
          <Route path="/videos" element={<VideoLibraryPage />} />
          <Route path="/videos/upload" element={<CanvasPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/videos/:id" element={<VideoDetailPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
