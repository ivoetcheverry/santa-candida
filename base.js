const SUPABASE_URL = "https://xmaplzwncqxvmlbsczif.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_zw24fTE6pgi0SJppwyw7pQ_0eNVR-Bp";

// Instancia global única para evitar duplicados
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function abrirDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SantaCandidaOfflineDB", 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("ganado")) {
        db.createObjectStore("ganado", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("servicios")) {
        db.createObjectStore("servicios", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cola_sincronizacion")) {
        db.createObjectStore("cola_sincronizacion", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function obtenerGanadoOffline() {
  const db = await abrirDB();
  
  if (navigator.onLine) {
    try {
      const { data, error } = await window.supabaseClient.from("ganado").select("*");
      if (!error && data) {
        const tx = db.transaction("ganado", "readwrite");
        const store = tx.objectStore("ganado");
        data.forEach(item => store.put(item));
        return data;
      }
    } catch (e) {
      console.warn("Sin conexión a Supabase, utilizando copia local almacenada.");
    }
  }

  return new Promise((resolve) => {
    const tx = db.transaction("ganado", "readonly");
    const req = tx.objectStore("ganado").getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function registrarServicioOffline(servicio) {
  servicio.id = servicio.id || crypto.randomUUID();
  const db = await abrirDB();

  const txServ = db.transaction("servicios", "readwrite");
  txServ.objectStore("servicios").put(servicio);

  if (navigator.onLine) {
    try {
      await window.supabaseClient.from("servicios").insert([servicio]);
      console.log("Servicio sincronizado en tiempo real con Supabase.");
      return;
    } catch (e) {
      console.warn("Error al subir directo, guardando en cola offline.");
    }
  }

  const txCola = db.transaction("cola_sincronizacion", "readwrite");
  txCola.objectStore("cola_sincronizacion").add({ tipo: "nuevo_servicio", datos: servicio });
  console.log("Guardado localmente. Se subirá automáticamente al detectar conexión.");
}

async function obtenerServiciosOffline() {
  const db = await abrirDB();
  
  if (navigator.onLine) {
    await sincronizarPendientes();
    try {
      const { data, error } = await window.supabaseClient.from("servicios").select("*");
      if (!error && data) {
        const tx = db.transaction("servicios", "readwrite");
        const store = tx.objectStore("servicios");
        data.forEach(item => store.put(item));
        return data;
      }
    } catch (e) {}
  }

  return new Promise((resolve) => {
    const tx = db.transaction("servicios", "readonly");
    const req = tx.objectStore("servicios").getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function sincronizarPendientes() {
  if (!navigator.onLine) return;
  const db = await abrirDB();
  const tx = db.transaction("cola_sincronizacion", "readwrite");
  const store = tx.objectStore("cola_sincronizacion");
  const req = store.getAll();

  req.onsuccess = async () => {
    const pendientes = req.result || [];
    for (const item of pendientes) {
      if (item.tipo === "nuevo_servicio") {
        const { error } = await window.supabaseClient.from("servicios").insert([item.datos]);
        if (!error) {
          const delTx = db.transaction("cola_sincronizacion", "readwrite");
          delTx.objectStore("cola_sincronizacion").delete(item.id);
        }
      }
    }
  };
}

window.addEventListener("online", () => {
  sincronizarPendientes();
});