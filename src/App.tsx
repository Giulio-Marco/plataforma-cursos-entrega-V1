import { Route, Routes } from "react-router-dom";
import { AppNavbar } from "./components/AppNavbar";
import { RequireAuth, RequireInstructor } from "./components/RequireAuth";
import { CatalogPage } from "./pages/CatalogPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { CourseFormPage } from "./pages/CourseFormPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ManagementPage } from "./pages/ManagementPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="container py-4 py-lg-5">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/cursos/:id" element={<CourseDetailPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/painel" element={<DashboardPage />} />
            <Route path="/checkout/:planoId" element={<CheckoutPage />} />
          </Route>

          <Route element={<RequireInstructor />}>
            <Route path="/cursos/novo" element={<CourseFormPage />} />
            <Route path="/gestao" element={<ManagementPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
