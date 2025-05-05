import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { logOut } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { FaGoogle } from "react-icons/fa";

export function LoginButton() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  
  const handleSignIn = () => {
    // Redirecionar para a página de login em vez de abrir o popup diretamente
    navigate("/admin/login");
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card p-1 rounded-full">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {currentUser.displayName?.charAt(0) || "U"}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoading}
          className="bg-white/10 hover:bg-white/20"
        >
          {isLoading ? "Saindo..." : "Sair"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center gap-2 bg-white text-primary hover:bg-white/90"
    >
      <FaGoogle className="h-4 w-4" />
      {isLoading ? "Entrando..." : "Entrar"}
    </Button>
  );
}