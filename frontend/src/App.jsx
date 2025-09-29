import { Routes, Route } from "react-router-dom";

// الصفحات
import HomePage from "./pages/HomePage";
import PatientForm from "./pages/PatientForm";
import About from "./pages/About";
import Consultations from "./pages/Consultations";
import ConsultationDetail from "./pages/ConsultationDetail";
import Settings from "./pages/Settings";
import DoctorLogin from "./pages/DoctorLogin"; 
import DoctorDashboard from "./pages/DoctorDashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import Checkout from "./pages/Checkout";
import PaymentResult from "./pages/PaymentResult";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminPanel from "./pages/AdminPanel";
import JobAds from "./pages/JobAds";


export default function App() {
  return (
    <Routes>
      {/* صفحات عامة */}
      <Route path="/" element={<HomePage />} />
      <Route path="/patient" element={<PatientForm />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<DoctorLogin />} />

      {/* إشعارات محمية */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* لوحة التحكم الخاصة بالطبيب */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="consultations" element={<Consultations />} /> 
        <Route path="consultations/:id" element={<ConsultationDetail />} /> 
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* لوحة التحكم الخاصة بالأدمن */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* صفحة الوظائف */}
      <Route path="/jobs" element={<JobAds />} /> 

      {/*Checkout*/}
      <Route path="/checkout" element={<Checkout />} />

      {/* نتيجة الدفع */}
      <Route path="/payment/result" element={<PaymentResult />} />
      <Route path="/success" element={<PaymentResult />} />
      <Route path="/failed" element={<PaymentResult />} />

      {/* صفحة 404 */}
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
