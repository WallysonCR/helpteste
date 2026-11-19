import { createContext, useContext, useEffect, useState } from "react";
import { authService, usuariosService } from "../lib/supabaseService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = carregando
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    authService.getSession().then(async (s) => {
      setSession(s);
      if (s?.user) {
        const u = await usuariosService.buscarPorAuthId(s.user.id);
        setUsuario(u);
      }
    });

    const { data: { subscription } } = authService.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (s?.user) {
        const u = await usuariosService.buscarPorAuthId(s.user.id);
        setUsuario(u);
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, usuario, signOut, loading: session === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
