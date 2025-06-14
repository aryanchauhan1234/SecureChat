// --- RSA Key Utilities ---

export async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  return keyPair;
}

export async function exportPublicKey(key) {
  const spki = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(spki)));
}

export async function exportPrivateKey(key) {
  const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", key);
  return btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
}

export async function importPublicKey(base64Key) {
  if (!base64Key || typeof base64Key !== "string") {
    throw new Error("❌ Invalid base64 public key input");
  }

  try {
    // Clean base64 (remove line breaks, padding errors, etc.)
    const cleanKey = base64Key.trim().replace(/\s/g, "");
    const binary = Uint8Array.from(atob(cleanKey), c => c.charCodeAt(0));

    return await crypto.subtle.importKey(
      "spki",
      binary,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  } catch (err) {
    console.error("❌ Failed to import public key:", err, base64Key);
    throw new Error("Public key import failed.");
  }
}


export async function importPrivateKey(base64Key) {
  const binary = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

// --- AES Utilities ---

export async function generateAESKey() {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAESKey(aesKey, publicKey) {
  const raw = await crypto.subtle.exportKey("raw", aesKey);
  return await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, raw);
}

export async function decryptAESKey(encrypted, privateKey) {
  const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
  return await crypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(message, aesKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(message)
  );
  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };
}

export async function decryptMessage(ciphertextBase64, ivBase64, aesKey) {
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

// --- IndexedDB Storage ---


const DB_NAME = "SecureChatKeys";
const STORE_NAME = "keys";

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SecureChatDB", 1);

    request.onupgradeneeded = (event) => {
      console.log("⚙️ Running onupgradeneeded");
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
        console.log("✅ Object store 'keys' created");
      }
    };

    request.onsuccess = () => {
      console.log("✅ IndexedDB opened successfully");
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("❌ IndexedDB open error:", event.target.error);
      reject("❌ Failed to open IndexedDB");
    };
  });
}


export async function storePrivateKey(userId, privateKey) {
  try {
    console.log("📥 Calling storePrivateKey for:", userId);

    const exported = await exportPrivateKey(privateKey);
    console.log("🔐 Exported private key");

    const db = await openDB();

    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");
    store.put(exported, `privateKey-${userId}`);

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`✅ Private key stored for user: ${userId}`);
        db.close();
        resolve();
      };
      tx.onerror = () => {
        console.error("❌ Transaction failed while storing private key");
        db.close();
        reject();
      };
    });
  } catch (err) {
    console.error("❌ Error in storePrivateKey:", err);
  }
}



export async function loadPrivateKey(userId) {
  try {
    console.log("🔍 Attempting to load private key for:", userId);

    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("SecureChatDB", 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys");
          console.log("ℹ️ Created object store 'keys' during upgrade");
        }
      };

      request.onsuccess = () => {
        console.log("📂 IndexedDB opened for reading private key");
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error("❌ Failed to open IndexedDB while loading private key:", event.target.error);
        reject(new Error("IndexedDB open failed"));
      };
    });

    const tx = db.transaction("keys", "readonly");
    const store = tx.objectStore("keys");
    const exportedKey = await new Promise((resolve, reject) => {
      const getRequest = store.get(`privateKey-${userId}`);

      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };

      getRequest.onerror = () => {
        reject(new Error("Failed to retrieve private key"));
      };
    });

    db.close();

    if (!exportedKey) {
      console.warn("⚠️ No private key found for user:", userId);
      return null;
    }

    const privateKey = await importPrivateKey(exportedKey);
    console.log("✅ Private key successfully loaded for user:", userId);
    return privateKey;

  } catch (err) {
    console.error("❌ Error in loadPrivateKey:", err);
    return null;
  }
}


