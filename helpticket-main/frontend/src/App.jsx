import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HelpTicketLoginScreen from "./modules/auth/screens/HelpTicketLoginScreen";
import DesignSystemShowcase from "./pages/DesignSystemShowcase";
import { Layout } from "./shared/components";
import HomeScreen from "./modules/dashboard/screens/HomeScreen";
import NotificationsScreen from "./modules/dashboard/screens/NotificationsScreen";
import ProfileScreen from "./modules/dashboard/screens/ProfileScreen";
import MyTicketsScreen from "./modules/tickets/screens/MyTicketsScreen";
import NewTicketScreen from "./modules/tickets/screens/NewTicketScreen";
import TicketDetailScreen from "./modules/tickets/screens/TicketDetailScreen";
import QueueScreen from "./modules/tickets/screens/QueueScreen";
import ReportsScreen from "./modules/admin/screens/ReportsScreen";
import UsersScreen from "./modules/admin/screens/UsersScreen";
import SettingsScreen from "./modules/admin/screens/SettingsScreen";
import KnowledgeBaseScreen from "./modules/knowledge/screens/KnowledgeBaseScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HelpTicketLoginScreen />} />
        <Route path="/design-system" element={<DesignSystemShowcase />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/inicio" replace />} />
          <Route path="inicio" element={<HomeScreen />} />
          <Route path="notificacoes" element={<NotificationsScreen />} />
          <Route path="perfil" element={<ProfileScreen />} />
          <Route path="meus-chamados" element={<MyTicketsScreen />} />
          <Route path="novo" element={<NewTicketScreen />} />
          <Route path="chamado/:id" element={<TicketDetailScreen />} />
          <Route path="fila" element={<QueueScreen />} />
          <Route path="relatorios" element={<ReportsScreen />} />
          <Route path="usuarios" element={<UsersScreen />} />
          <Route path="configuracoes" element={<SettingsScreen />} />
          <Route path="faq" element={<KnowledgeBaseScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
