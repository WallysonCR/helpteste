import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Inbox, 
  PlusCircle, 
  ListTodo, 
  BarChart3, 
  Users, 
  LogOut,
  Search,
  Bell,
  Settings,
  BookOpen
} from "lucide-react";
import { Button, Avatar } from "../index";
import { notificacoesApi } from "../../../lib/api";
import "./Layout.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("helpticket_token");
  const storedUser = JSON.parse(localStorage.getItem("helpticket_user") || "{}");
  const nomeUsuario = storedUser.nome || "Usuário";
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    if (storedUser.expiraEm && new Date(storedUser.expiraEm) < new Date()) {
      localStorage.removeItem("helpticket_token");
      localStorage.removeItem("helpticket_user");
      navigate("/", { replace: true });
      return;
    }
    notificacoesApi
      .listar()
      .then((list) => setHasUnread(list.some((n) => !n.lida)))
      .catch(() => {});
  }, [token, storedUser.expiraEm, navigate, location.pathname]);

  // Keep-alive a cada 10 minutos para evitar que o Render hiberne enquanto a aba estiver aberta
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      notificacoesApi
        .listar()
        .then((list) => setHasUnread(list.some((n) => !n.lida)))
        .catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("helpticket_token");
    localStorage.removeItem("helpticket_user");
  };

  const tipoUsuario = storedUser.tipoUsuario || "Solicitante";
  const isAdmin = tipoUsuario === "Administrador";
  const isStaff = tipoUsuario === "Agente" || isAdmin;

  const menuItems = [
    { to: "/app/inicio", icon: Home, label: "Início", show: true },
    { to: "/app/meus-chamados", icon: Inbox, label: "Meus Chamados", show: true },
    { to: "/app/novo", icon: PlusCircle, label: "Novo Chamado", show: true },
    { to: "/app/fila", icon: ListTodo, label: "Fila", show: isStaff },
    { to: "/app/relatorios", icon: BarChart3, label: "Relatórios", show: isStaff },
    { to: "/app/usuarios", icon: Users, label: "Usuários", show: isAdmin },
    { to: "/app/faq", icon: BookOpen, label: "Base de Conhecimento", show: true },
    { to: "/app/configuracoes", icon: Settings, label: "Configurações", show: isAdmin },
  ].filter(item => item.show);

  return (
    <div className="ht-layout">
      {/* Sidebar */}
      <aside className="ht-layout__sidebar">
        <div className="ht-layout__sidebar-header">
          <div className="ht-layout__logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0 }}>
              <defs>
                <linearGradient id="ht-sidebar-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#0066B2"/>
                  <stop offset="100%" stop-color="#005599"/>
                </linearGradient>
                <linearGradient id="ht-sidebar-ticket" x1="16" y1="22" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#FFFFFF"/>
                  <stop offset="100%" stop-color="#E0F2FE"/>
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="16" fill="url(#ht-sidebar-bg)"/>
              <rect x="2" y="2" width="60" height="60" rx="14" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5"/>
              <path d="M16 31C16 21.6112 23.1634 14 32 14C40.8366 14 48 21.6112 48 31" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round"/>
              <rect x="12" y="28" width="6" height="12" rx="3" fill="#E0F2FE"/>
              <rect x="46" y="28" width="6" height="12" rx="3" fill="#E0F2FE"/>
              <path d="M20 25C20 23.3431 21.3431 22 23 22H41C42.6569 22 44 23.3431 44 25V31.5C42.067 31.5 40.5 33.067 40.5 35C40.5 36.933 42.067 38.5 44 38.5V45C44 46.6569 42.6569 48 41 48H23C21.3431 48 20 46.6569 20 45V38.5C21.933 38.5 23.5 36.933 23.5 35C23.5 33.067 21.933 31.5 20 31.5V25Z" fill="url(#ht-sidebar-ticket)"/>
              <line x1="25" y1="29" x2="39" y2="29" stroke="#0066B2" strokeOpacity="0.35" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="2.5 3"/>
              <path d="M27.5 38L30.8 41.2L37 34.8" stroke="#0066B2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              HelpTicket <span>PORTAL</span>
            </div>
          </div>
          <Button icon={PlusCircle} full onClick={() => navigate("/app/novo")}>Novo Chamado</Button>
        </div>
        
        <nav className="ht-layout__sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              className={({ isActive }) => `ht-layout__nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ht-layout__sidebar-footer">
          <NavLink to="/" className="ht-layout__nav-link" end onClick={handleLogout}>
            <LogOut size={20} />
            Sair do sistema
          </NavLink>
        </div>
      </aside>

      {/* Main Area */}
      <div className="ht-layout__main">
        {/* Topbar */}
        <header className="ht-layout__topbar">
          <div className="ht-layout__topbar-search">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12 }} />
              <input 
                type="text" 
                placeholder="Buscar chamado, usuário ou termo..." 
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    navigate(`/app/meus-chamados?q=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid transparent',
                  background: 'var(--color-surface-hover)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div className="ht-layout__topbar-actions">
            <Link to="/app/notificacoes" className="ht-layout__notification-btn" aria-label="Notificações">
              <Bell size={20} />
              {hasUnread && <span className="ht-layout__notification-dot"></span>}
            </Link>
            <Link to="/app/perfil" style={{ textDecoration: 'none' }} title={nomeUsuario}>
              <Avatar name={nomeUsuario} size="sm" status="online" />
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="ht-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
