import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { loadPrivateKey } from "./Utils/cryptoUtils";
// import {LoadPrivateKeyEffect} from "./useeffect/LoadPrivateKeyEffect.jsx";


import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore();
  const { theme } = useThemeStore();
  const setPrivateKey = useAuthStore((state) => state.setPrivateKey);

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


   useEffect(() => {
      const restorePrivateKey = async () => {
        if (!authUser?._id) return;
  
        const privateKey = await loadPrivateKey(authUser._id);
        if (privateKey) {
          setPrivateKey(privateKey);
          console.log("🔑 Private key loaded after refresh");
        } else {
          console.warn("⚠️ No private key found in IndexedDB");
        }
      };
  
      restorePrivateKey();
    }, [authUser?._id]);



  console.log({ authUser });



  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      {/* <LoadPrivateKeyEffect /> */}
     { authUser ? <Navbar /> :""}
     {/* <Navbar /> */}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
