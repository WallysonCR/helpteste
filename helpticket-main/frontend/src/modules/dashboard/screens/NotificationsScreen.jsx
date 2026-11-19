import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, AlertCircle, CheckCircle, Bell } from "lucide-react";
import { Card, Button, Badge, EmptyState } from "../../../shared/components";
import { notificacoesApi } from "../../../lib/api";
import "./NotificationsScreen.css";

function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificacoesApi
      .listar()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.lida).length;

  const markAllAsRead = async () => {
    await notificacoesApi.marcarTodasLidas();
    setNotifications(notifications.map(n => ({ ...n, lida: true })));
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case "ComentarioAdicionado": return <MessageSquare size={18} />;
      case "TicketAtribuido": return <AlertCircle size={18} />;
      case "StatusAlterado": return <CheckCircle size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getTitle = (notif) => {
    switch (notif.tipo) {
      case "ComentarioAdicionado": return `Novo comentário no chamado #${notif.idTicket}`;
      case "TicketAtribuido": return `Chamado #${notif.idTicket} atribuído`;
      case "StatusAlterado": return `Atualização no chamado #${notif.idTicket}`;
      default: return `Chamado #${notif.idTicket}`;
    }
  };

  return (
    <div className="notifications-screen">
      <header className="notifications-screen__header">
        <h1 className="notifications-screen__title">Notificações</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </header>

      <Card>
        {loading ? (
          <div className="ht-loader-card" style={{ border: "none" }}>
            <div className="ht-spinner" />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
              Carregando suas notificações...
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState 
            icon={Bell} 
            title="Nenhuma notificação" 
            description="Você não tem notificações recentes." 
          />
        ) : (
          <div className="notifications-list">
            {notifications.map(notif => (
              <div
                key={notif.idNotificacao}
                className={`notification-item ${!notif.lida ? 'notification-item--unread' : ''}`}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/app/chamado/${notif.idTicket}`)}
              >
                <div className="notification-item__icon">
                  {getIcon(notif.tipo)}
                </div>
                <div className="notification-item__content">
                  <div className="notification-item__header">
                    <h3 className="notification-item__title">
                      {getTitle(notif)}
                      {!notif.lida && <Badge tone="info" dot style={{marginLeft: '8px'}}>Nova</Badge>}
                    </h3>
                    <span className="notification-item__time">
                      {new Date(notif.dataEnvio).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="notification-item__message">{notif.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default NotificationsScreen;
