import useLoginController from "../controllers/useLoginController";
import LoginCard from "../components/LoginCard";
import "./HelpTicketLoginScreen.css";

function HelpTicketLoginScreen({ onLoginSuccess }) {
  const controller = useLoginController(onLoginSuccess);
  return <main className="login-screen"><LoginCard controller={controller} /></main>;
}
export default HelpTicketLoginScreen;
