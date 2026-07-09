import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import OnboardingLayout from "./onboarding/OnboardingLayout";
import ProfilePage from "./onboarding/pages/ProfilePage";
import AddressPage from "./onboarding/pages/AddressPage";
import VerificationPage from "./onboarding/pages/VerificationPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CustomerHome from "./pages/customer/CustomerHome";
import OrdersPage from "./pages/customer/OrdersPage";
import NewOrderPage from "./pages/customer/NewOrderPage";
import CustomerOrderDetail from "./pages/customer/CustomerOrderDetail";
import AgentHome from "./pages/agent/AgentHome";
import PendingRequestsPage from "./pages/agent/PendingRequestsPage";
import OngoingRequestsPage from "./pages/agent/OngoingRequestsPage";
import AssignedRequestsPage from "./pages/agent/AssignedRequestsPage";
import AgentOrderDetail from "./pages/agent/AgentOrderDetail";
import AdminHome from "./pages/admin/AdminHome";
import AdminAgentsPage from "./pages/admin/AdminAgentsPage";
import AdminServiceCentersPage from "./pages/admin/AdminServiceCentersPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import {
  ProtectedRoute,
  GuestRoute,
  OnboardingRoute,
  CustomerOnlyRoute,
  RoleRoute,
  ProfileGuard,
  RoleRedirect,
} from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />

        <Route
          path="/:role/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingRoute>
                <OnboardingLayout />
              </OnboardingRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="address" element={<AddressPage />} />
          <Route
            path="verification"
            element={
              <CustomerOnlyRoute>
                <VerificationPage />
              </CustomerOnlyRoute>
            }
          />
        </Route>

        <Route path="/dashboard" element={<RoleRedirect />} />

        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <RoleRoute role="customer">
                <ProfileGuard>
                  <DashboardLayout role="customer" />
                </ProfileGuard>
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerHome />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/new" element={<NewOrderPage />} />
          <Route path="orders/:reqId" element={<CustomerOrderDetail />} />
        </Route>

        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <RoleRoute role="agent">
                <ProfileGuard>
                  <DashboardLayout role="agent" />
                </ProfileGuard>
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AgentHome />} />
          <Route path="pending" element={<PendingRequestsPage />} />
          <Route path="ongoing" element={<OngoingRequestsPage />} />
          <Route path="assigned" element={<AssignedRequestsPage />} />
          <Route path="orders/:reqId" element={<AgentOrderDetail />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute role="admin">
                <DashboardLayout role="admin" />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="agents" element={<AdminAgentsPage />} />
          <Route path="service-centers" element={<AdminServiceCentersPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
