import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { loadPrivateKey } from "./utils/crypto"; // adjust path if needed

const LoadPrivateKeyEffect = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const setPrivateKey = useAuthStore((state) => state.setPrivateKey);

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

  return null; // this is just a side-effect
};

export default LoadPrivateKeyEffect;
