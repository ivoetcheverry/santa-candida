let ganadoMemoria = [];
let serviciosMemoria = [];
let animalActual = null;
let toroActual = null;
let visorFotosActuales = [];
let visorIndiceActual = 0;
let filtroPartoActual = 'todos';

const TOROS_CATALOGO_INICIAL = [
  { id: "toro-caracho", nombre: "Caracho", hba: "845146", rp: "2105", fecha_nacimiento: "2017-08-13", peso_nacer: 36, peso_205d: 343, peso_ano: 600, peso_maduro: 980, frame: 4.1, circunferencia_escrotal: 40, pedigree: "Remixado x Bismarck x Final Dream", criador: "Cabaña Don José", propietario: "Cabaña Don José", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/2105.jpg" },
  { id: "toro-remixado", nombre: "Remixado", hba: "831468", rp: "1717", fecha_nacimiento: "2015-01-01", peso_nacer: 28, peso_205d: 265, peso_ano: 580, peso_maduro: 989, frame: 4.7, circunferencia_escrotal: 43, pedigree: null, criador: "Cabaña Don José", propietario: "Cabaña Don José / Cabaña La Guagua", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/1717.jpg" },
  { id: "toro-record", nombre: "Record", hba: "870459", rp: "579", fecha_nacimiento: "2020-08-08", peso_nacer: 34, peso_205d: 325, peso_ano: 630, peso_maduro: 1020, frame: 4.3, circunferencia_escrotal: 43, pedigree: "Reckoning x Yesquero x Perks Advance", criador: "Los Murmullos", propietario: "Cabaña El Cortijo de Campos de Torres", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/579.jpg" },
  { id: "toro-halcon", nombre: "Halcón", hba: "884763", rp: "8554", fecha_nacimiento: "2021-08-06", peso_nacer: 38, peso_205d: 321, peso_ano: 612, peso_maduro: 875, frame: 5.0, circunferencia_escrotal: 43, pedigree: "Prolijo x Quebrantador x Saugahatchee 3000", criador: "Cabaña La Rubeta", propietario: "Cabaña La Rubeta / Eaglehawk Angus", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/8554.jpg" },
  { id: "toro-lucuma", nombre: "Lúcuma", hba: "834939", rp: "4178", fecha_nacimiento: "2016-08-30", peso_nacer: 28, peso_205d: 195, peso_ano: 430, peso_maduro: 890, frame: 4.5, circunferencia_escrotal: 41, pedigree: "Paine x Iporazo x Helvion", criador: "Casamu S.A.", propietario: "Select Debernardi / Cab. La Esencia / Cab. La Maruca", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/4178.jpg" },
  { id: "toro-napolitano", nombre: "Napolitano", hba: "842678", rp: "449", fecha_nacimiento: "2017-07-25", peso_nacer: 35, peso_205d: 304, peso_ano: 620, peso_maduro: 980, frame: 4.0, circunferencia_escrotal: 44, pedigree: "Napoleon x Sirocco x Falta Envido", criador: "Cabaña Santa Rosa", propietario: "Cabaña Santa Rosa", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/449.jpg" },
  { id: "toro-precoz", nombre: "Precoz", hba: "847918", rp: "7951", fecha_nacimiento: "2017-12-11", peso_nacer: 33, peso_205d: 340, peso_ano: 745, peso_maduro: 935, frame: 4.9, circunferencia_escrotal: 43, pedigree: "Franco x Quebrantador x Sakic", criador: "Rubeta S.A.", propietario: "Rubeta S.A. / Milkland / Santa Cecilia Agrop. S.A. / Cab. Mis Amores", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/7951.jpg" },
  { id: "toro-rufian", nombre: "Rufián", hba: "871775", rp: "963", fecha_nacimiento: "2020-09-01", peso_nacer: 33, peso_205d: 381, peso_ano: 480, peso_maduro: 820, frame: 3.4, circunferencia_escrotal: 41, pedigree: null, criador: "Cabaña Santa Rosa", propietario: "Cabaña Santa Rosa", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/963.jpg" },
  { id: "toro-rumi", nombre: "Rumi", hba: "867566", rp: "B326", fecha_nacimiento: "2018-08-09", peso_nacer: 31, peso_205d: 209, peso_ano: 584, peso_maduro: 894, frame: null, circunferencia_escrotal: 42, pedigree: "Lúcuma x Elunche", criador: "Casamu S.A.", propietario: "Casamu S.A. (Comercializa Select Debernardi)", sexo: "M", tipo: "Toro Reproductor", foto_url: "./img/toros/b326.jpg" }
];

document.addEventListener("DOMContentLoaded", () => {
  const hoy = new Date().toISOString().split("T")[0];
  const inputFecha = document.getElementById("srv-fecha");
  if (inputFecha) {
    inputFecha.value = hoy;
    actualizarFPP();
  }

  window.addEventListener("online", actualizarEstadoRed);
  window.addEventListener("offline", actualizarEstadoRed);
  actualizarEstadoRed();

  setTimeout(cargarDatosSeguro, 50);
});

function actualizarEstadoRed() {
  const el = document.getElementById("estado-red");
  if (!el) return;
  if (navigator.onLine) {
    el.innerText = "Online";
    el.className = "text-xs bg-green-600 px-2 py-0.5 rounded-full font-semibold";
  } else {
    el.innerText = "Offline (Sin Señal)";
    el.className = "text-xs bg-amber-600 px-2 py-0.5 rounded-full font-semibold";
  }
}

function cambiarVista(vista) {
  ["inventario", "toros", "servicios", "arbol"].forEach((v) => {
    const seccion = document.getElementById(`vista-${v}`);
    const btn = document.getElementById(`btn-${v}`);
    if (seccion) seccion.classList.add("hidden");
    if (btn) btn.className = "px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold";
  });

  const seccionActiva = document.getElementById(`vista-${vista}`);
  const btnActivo = document.getElementById(`btn-${vista}`);
  if (seccionActiva) seccionActiva.classList.remove("hidden");
  if (btnActivo) btnActivo.className = "px-3 py-1.5 rounded-lg bg-white text-green-900 font-bold shadow";

  if (vista === "toros") renderizarToros(ganadoMemoria);
  if (vista === "servicios") poblarSelectTorosServicio();
}

async function cargarDatosSeguro() {
  try {
    let ganadoLocal = [];
    try {
      if (typeof obtenerGanadoOffline === 'function') {
        ganadoLocal = await obtenerGanadoOffline();
      }
    } catch (e) {
      ganadoLocal = JSON.parse(localStorage.getItem("ganado_santa_candida") || "[]");
    }

    let baseGanado = Array.isArray(ganadoLocal) ? ganadoLocal : [];
    TOROS_CATALOGO_INICIAL.forEach(toroCat => {
      const existe = baseGanado.some(a => String(a.rp).toLowerCase() === String(toroCat.rp).toLowerCase() || (a.nombre && a.nombre.toLowerCase() === toroCat.nombre.toLowerCase()));
      if (!existe) baseGanado.push(toroCat);
    });

    ganadoMemoria = baseGanado;
    
    let serviciosLocal = [];
    try {
      if (typeof obtenerServiciosOffline === 'function') {
        serviciosLocal = await obtenerServiciosOffline();
      }
    } catch (e) {}
    
    const serviciosStorage = JSON.parse(localStorage.getItem("servicios_santa_candida") || "[]");
    serviciosMemoria = (serviciosLocal && serviciosLocal.length > 0) ? serviciosLocal : serviciosStorage;

    renderizarGanado(ganadoMemoria);
    renderizarServicios(serviciosMemoria);
    poblarSelectTorosServicio();
  } catch (err) {
    console.error("Error al cargar datos:", err);
    ganadoMemoria = TOROS_CATALOGO_INICIAL;
    renderizarGanado(ganadoMemoria);
  }
}

function poblarSelectTorosServicio() {
  const select = document.getElementById("srv-toro-select");
  if (!select) return;

  const toros = ganadoMemoria.filter(a => {
    const nombre = (a.nombre || "").toLowerCase();
    const tipo = (a.tipo || "").toLowerCase();
    const sexo = (a.sexo || "").toLowerCase();
    if (nombre.includes("herja") || tipo.includes("vaca") || tipo.includes("vaquillona")) return false;
    return sexo === "m" || sexo === "macho" || tipo.includes("toro") || tipo.includes("reproductor") || a.circunferencia_escrotal;
  });

  const listaToros = toros.length > 0 ? toros : ganadoMemoria.filter(a => !((a.nombre || "").toLowerCase().includes("herja")));

  select.innerHTML = `<option value="">Seleccionar toro del inventario...</option>` + 
    listaToros.map(t => `<option value="${t.nombre || t.rp}">RP: ${t.rp} - ${t.nombre || 'Sin nombre'}</option>`).join("");
}

function sincronizarToroSelect(el) {
  const inputToro = document.getElementById("srv-toro");
  if (inputToro && el.value) inputToro.value = el.value;
}

function seleccionarTipoServicio(tipo) {
  document.getElementById("srv-tipo").value = tipo;
  ["IA", "Natural", "Repaso"].forEach(t => {
    const btn = document.getElementById(`btntipo-${t}`);
    if (!btn) return;
    if (t === tipo) {
      btn.className = "p-2 text-xs font-bold rounded-lg border bg-green-50 border-green-600 text-green-800 transition-all shadow-sm";
    } else {
      btn.className = "p-2 text-xs font-bold rounded-lg border bg-white border-gray-200 text-gray-700 transition-all";
    }
  });
}

function renderizarGanado(lista) {
  const tbody = document.getElementById("tabla-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No hay animales registrados.</td></tr>`;
    return;
  }

  lista.forEach(animal => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-green-50 cursor-pointer transition-colors";
    tr.onclick = () => abrirFichaAnimal(animal);
    tr.innerHTML = `
      <th class="p-3 font-bold text-green-900">${animal.rp || "-"}</th>
      <td class="p-3 font-semibold">${animal.nombre || "-"}</td>
      <td class="p-3 text-gray-600">${animal.hba || "-"}</td>
      <td class="p-3 text-blue-800">${animal.padre || animal.nombre_padre || "-"}</td>
      <td class="p-3 text-pink-800">${animal.madre || animal.nombre_madre || "-"}</td>
      <td class="p-3"><span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">${animal.tipo || "Propio"}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarGanado() {
  const inputB = document.getElementById("input-buscar");
  if (!inputB) return;
  const query = inputB.value.trim().toLowerCase();
  if (!query) {
    renderizarGanado(ganadoMemoria);
    return;
  }

  const esNumero = /^\d+$/.test(query);

  const filtrados = ganadoMemoria.filter(animal => {
    if (esNumero) {
      return animal.rp && animal.rp.toString().toLowerCase().includes(query);
    } else {
      const nombre = (animal.nombre || "").toLowerCase();
      const padre = (animal.padre || animal.nombre_padre || "").toLowerCase();
      const madre = (animal.madre || animal.nombre_madre || "").toLowerCase();
      const rp = (animal.rp || "").toString().toLowerCase();
      return nombre.includes(query) || padre.includes(query) || madre.includes(query) || rp.includes(query);
    }
  });

  renderizarGanado(filtrados);
}

function renderizarToros(lista) {
  const tbody = document.getElementById("tabla-toros-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const toros = lista.filter(a => {
    const nombre = (a.nombre || "").toLowerCase();
    const tipo = (a.tipo || "").toLowerCase();
    const sexo = (a.sexo || "").toLowerCase();
    if (nombre.includes("herja") || tipo.includes("vaca") || tipo.includes("vaquillona")) return false;
    return sexo === "m" || sexo === "macho" || tipo.includes("toro") || tipo.includes("reproductor") || a.circunferencia_escrotal || TOROS_CATALOGO_INICIAL.some(tc => String(tc.rp).toLowerCase() === String(a.rp).toLowerCase());
  });

  if (toros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No hay toros registrados.</td></tr>`;
    return;
  }

  toros.forEach(toro => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-blue-50 cursor-pointer transition-colors";
    tr.onclick = () => abrirFichaToro(toro);
    tr.innerHTML = `
      <th class="p-3 font-bold text-blue-900">${toro.rp || "-"}</th>
      <td class="p-3 font-semibold">${toro.nombre || "-"}</td>
      <td class="p-3 text-gray-600">${toro.hba || "-"}</td>
      <td class="p-3 text-gray-800 font-bold">${toro.circunferencia_escrotal || toro.ce || "No reg."} cm</td>
      <td class="p-3"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">${toro.tipo || "Toro Reproductor"}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filtrarToros() {
  const inputBT = document.getElementById("input-buscar-toro");
  if (!inputBT) return;
  const query = inputBT.value.trim().toLowerCase();
  if (!query) {
    renderizarToros(ganadoMemoria);
    return;
  }
  const filtrados = ganadoMemoria.filter(a => {
    const rp = String(a.rp || "").toLowerCase();
    const nombre = String(a.nombre || "").toLowerCase();
    const hba = String(a.hba || "").toLowerCase();
    return rp.includes(query) || nombre.includes(query) || hba.includes(query);
  });
  renderizarToros(filtrados);
}

function abrirFichaToro(toro) {
  toroActual = toro;
  document.getElementById("toro-rp").innerText = toro.rp || "-";
  document.getElementById("toro-nombre").innerText = toro.nombre || "Sin nombre";
  document.getElementById("toro-hba").innerText = toro.hba || "-";
  document.getElementById("toro-ce").innerText = (toro.circunferencia_escrotal || toro.ce || "Sin registrar") + " cm";

  const savedPhoto = localStorage.getItem(`toro_foto_${toro.id || toro.rp}`) || toro.foto_url;
  const img = document.getElementById("toro-img");
  const placeholder = document.getElementById("toro-foto-placeholder");
  if (savedPhoto && img && placeholder) {
    img.src = savedPhoto;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else if (img && placeholder) {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }

  renderGaleriaToroSupabase();
  renderServiciosToro();
  document.getElementById("modal-toro").classList.remove("hidden");
}

function cerrarFichaToro() {
  document.getElementById("modal-toro").classList.add("hidden");
  toroActual = null;
}

function guardarFotoToro(event) {
  const file = event.target.files[0];
  if (!file || !toroActual) return;
  const urlFoto = URL.createObjectURL(file);
  const rpIdentificador = toroActual.rp || toroActual.id;
  
  localStorage.setItem(`toro_foto_${rpIdentificador}`, urlFoto);
  toroActual.foto_url = urlFoto;

  const img = document.getElementById("toro-img");
  const placeholder = document.getElementById("toro-foto-placeholder");
  if (img && placeholder) {
    img.src = urlFoto;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  }
}

// --- CONEXIÓN DIRECTA SUPABASE STORAGE ---
async function subirMultimediaSupabase(event) {
  const files = event.target.files;
  if (!files || !files.length || !animalActual) return;

  if (typeof supabaseClient === 'undefined') {
    alert("Error: Supabase no está inicializado.");
    return;
  }

  const rp = animalActual.rp || animalActual.id;
  const container = document.getElementById("ficha-galeria");
  if (container) container.innerHTML = `<p class="text-xs text-blue-600 col-span-4 font-bold animate-pulse">⬆️ Subiendo archivos a Supabase Storage...</p>`;

  for (let file of files) {
    const timestamp = Date.now();
    const fileName = `galeria_${rp}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    try {
      await supabaseClient.storage
        .from('fotos-ganado')
        .upload(fileName, file);
    } catch (err) {
      console.error("Error al subir archivo:", err);
    }
  }

  renderGaleriaFotosSupabase();
  if (event.target) event.target.value = "";
}

async function renderGaleriaFotosSupabase() {
  if (!animalActual) return;
  const container = document.getElementById("ficha-galeria");
  if (!container) return;  
  const rp = animalActual.rp || animalActual.id;

  if (typeof supabaseClient === 'undefined') {
    container.innerHTML = `<p class="text-xs text-gray-400 col-span-4">Supabase no disponible.</p>`;
    return;
  }

  try {
    const { data, error } = await supabaseClient.storage
      .from('fotos-ganado')
      .list('', { search: `galeria_${rp}_` });

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-400 col-span-4">No hay fotos o videos en Supabase para este animal.</p>`;
      visorFotosActuales = [];
      return;
    }

    visorFotosActuales = data.map(item => {
      const { data: publicUrlData } = supabaseClient.storage
        .from('fotos-ganado')
        .getPublicUrl(item.name);
      
      const esVideo = item.name.match(/\.(mp4|mov|avi|mkv|webm)$/i);
      return {
        url: publicUrlData.publicUrl,
        tipo: esVideo ? 'video' : 'imagen',
        nombre: item.name
      };
    });

    container.innerHTML = visorFotosActuales.map((item, index) => {
      const esVideo = item.tipo === 'video';
      let contenidoVisual = esVideo 
        ? `<video src="${item.url}" class="w-full h-full object-cover pointer-events-none"></video><div class="absolute inset-0 flex items-center justify-center bg-black/40"><span class="text-white text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">▶ Video</span></div>`
        : `<img src="${item.url}" class="w-full h-full object-cover">`;

      return `
        <div class="relative group w-full h-16 bg-gray-100 rounded-lg overflow-hidden border cursor-pointer" onclick="abrirVisorGaleria(${index})">
          ${contenidoVisual}
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Error listando archivos:", err);
    container.innerHTML = `<p class="text-xs text-red-500 col-span-4">Error al conectar con Supabase.</p>`;
  }
}

async function subirMultimediaToroSupabase(event) {
  const files = event.target.files;
  if (!files || !files.length || !toroActual) return;

  if (typeof supabaseClient === 'undefined') {
    alert("Error: Supabase no está inicializado.");
    return;
  }

  const rp = toroActual.rp || toroActual.id;
  const container = document.getElementById("toro-galeria");
  if (container) container.innerHTML = `<p class="text-xs text-blue-600 col-span-4 font-bold animate-pulse">⬆️ Subiendo archivos a Supabase Storage...</p>`;

  for (let file of files) {
    const timestamp = Date.now();
    const fileName = `galeria_toro_${rp}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    try {
      await supabaseClient.storage
        .from('fotos-ganado')
        .upload(fileName, file);
    } catch (err) {
      console.error("Excepción al subir toro:", err);
    }
  }

  renderGaleriaToroSupabase();
  if (event.target) event.target.value = "";
}

async function renderGaleriaToroSupabase() {
  if (!toroActual) return;
  const container = document.getElementById("toro-galeria");
  if (!container) return;  
  const rp = toroActual.rp || toroActual.id;

  if (typeof supabaseClient === 'undefined') return;

  try {
    const { data, error } = await supabaseClient.storage
      .from('fotos-ganado')
      .list('', { search: `galeria_toro_${rp}_` });

    if (error || !data || data.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-400 col-span-4">No hay fotos o videos en Supabase para este toro.</p>`;
      visorFotosActuales = [];
      return;
    }

    visorFotosActuales = data.map(item => {
      const { data: publicUrlData } = supabaseClient.storage
        .from('fotos-ganado')
        .getPublicUrl(item.name);
      
      const esVideo = item.name.match(/\.(mp4|mov|avi|mkv|webm)$/i);
      return {
        url: publicUrlData.publicUrl,
        tipo: esVideo ? 'video' : 'imagen',
        nombre: item.name
      };
    });

    container.innerHTML = visorFotosActuales.map((item, index) => {
      const esVideo = item.tipo === 'video';
      let contenidoVisual = esVideo 
        ? `<video src="${item.url}" class="w-full h-full object-cover pointer-events-none"></video><div class="absolute inset-0 flex items-center justify-center bg-black/40"><span class="text-white text-xs font-bold bg-black/60 px-1.5 py-0.5 rounded">▶ Video</span></div>`
        : `<img src="${item.url}" class="w-full h-full object-cover">`;

      return `
        <div class="relative group w-full h-16 bg-gray-100 rounded-lg overflow-hidden border cursor-pointer" onclick="abrirVisorGaleria(${index})">
          ${contenidoVisual}
        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Error listando archivos de toro:", err);
  }
}

// --- VISOR PANTALLA GRANDE ---
function abrirVisorFotoPrincipal() {
  const savedPhoto = localStorage.getItem(`foto_${animalActual.id || animalActual.rp}`);
  if (!savedPhoto) return;
  
  visorFotosActuales = [{ url: savedPhoto, tipo: 'imagen' }];
  visorIndiceActual = 0;
  mostrarVisorActual();
}

function abrirVisorFotoToroPrincipal() {
  const savedPhoto = localStorage.getItem(`toro_foto_${toroActual.id || toroActual.rp}`) || toroActual.foto_url;
  if (!savedPhoto) return;
  
  visorFotosActuales = [{ url: savedPhoto, tipo: 'imagen' }];
  visorIndiceActual = 0;
  mostrarVisorActual();
}

function abrirVisorGaleria(index) {
  visorIndiceActual = index;
  mostrarVisorActual();
}

function mostrarVisorActual() {
  if (!visorFotosActuales || visorFotosActuales.length === 0) return;
  
  const itemActual = visorFotosActuales[visorIndiceActual];
  const urlArchivo = itemActual.url;
  const esVideo = itemActual.tipo === 'video';

  let elementoVisual = document.getElementById("visor-img-grande");
  
  if (esVideo) {
    if (!elementoVisual || elementoVisual.tagName !== "VIDEO") {
      const nuevoVideo = document.createElement("video");
      nuevoVideo.id = "visor-img-grande";
      nuevoVideo.controls = true;
      nuevoVideo.autoplay = true;
      nuevoVideo.className = "max-h-[80vh] max-w-full object-contain rounded-lg";
      if (elementoVisual) elementoVisual.replaceWith(nuevoVideo);
      elementoVisual = nuevoVideo;
    }
    elementoVisual.src = urlArchivo;
  } else {
    if (!elementoVisual || elementoVisual.tagName !== "IMG") {
      const nuevaImg = document.createElement("img");
      nuevaImg.id = "visor-img-grande";
      nuevaImg.className = "max-h-[80vh] max-w-full object-contain rounded-lg";
      if (elementoVisual) elementoVisual.replaceWith(nuevaImg);
      elementoVisual = nuevaImg;
    }
    elementoVisual.src = urlArchivo;
  }

  const indicador = document.getElementById("visor-indicador");
  const btnPrev = document.getElementById("btn-visor-prev");
  const btnNext = document.getElementById("btn-visor-next");

  if (visorFotosActuales.length > 1) {
    if (indicador) {
      indicador.innerText = `Archivo ${visorIndiceActual + 1} de ${visorFotosActuales.length}`;
      indicador.classList.remove("hidden");
    }
    if (btnPrev) btnPrev.classList.remove("hidden");
    if (btnNext) btnNext.classList.remove("hidden");
  } else {
    if (indicador) indicador.classList.add("hidden");
    if (btnPrev) btnPrev.classList.add("hidden");
    if (btnNext) btnNext.classList.add("hidden");
  }

  const modalVisor = document.getElementById("modal-visor-foto");
  if (modalVisor) modalVisor.classList.remove("hidden");
}

function cambiarFotoVisor(direccion) {
  if (visorFotosActuales.length <= 1) return;
  visorIndiceActual += direccion;
  if (visorIndiceActual < 0) visorIndiceActual = visorFotosActuales.length - 1;
  if (visorIndiceActual >= visorFotosActuales.length) visorIndiceActual = 0;
  mostrarVisorActual();
}

function cerrarVisorFoto() {
  const visor = document.getElementById("visor-img-grande");
  if (visor && visor.tagName === "VIDEO") {
    visor.pause();
    visor.src = "";
  }
  const modalVisor = document.getElementById("modal-visor-foto");
  if (modalVisor) modalVisor.classList.add("hidden");
}

function abrirFichaAnimal(animal) {
  animalActual = animal;
  document.getElementById("ficha-rp").innerText = animal.rp || "-";
  document.getElementById("ficha-nombre").innerText = animal.nombre || "Sin nombre";
  document.getElementById("ficha-hba").innerText = animal.hba || "-";
  
  const nombrePadre = animal.padre || animal.nombre_padre || "No registrado";
  const nombreMadre = animal.madre || animal.nombre_madre || "No registrada";
  
  document.getElementById("ficha-padre").innerText = nombrePadre;
  document.getElementById("ficha-madre").innerText = nombreMadre;
  document.getElementById("ficha-tipo").innerText = animal.tipo || "Propio";

  const boxPadre = document.getElementById("box-padre");
  const padreEncontrado = ganadoMemoria.find(a => (a.rp && String(a.rp) === String(animal.rp_padre)) || (a.nombre && a.nombre.toLowerCase() === nombrePadre.toLowerCase()));
  if (padreEncontrado) {
    boxPadre.onclick = () => {
      if ((padreEncontrado.sexo || "").toLowerCase() === "m" || (padreEncontrado.sexo || "").toLowerCase() === "macho" || (padreEncontrado.tipo || "").toLowerCase().includes("toro")) {
        abrirFichaToro(padreEncontrado);
      } else {
        abrirFichaAnimal(padreEncontrado);
      }
    };
  } else {
    boxPadre.onclick = null;
  }

  const boxMadre = document.getElementById("box-madre");
  const madreEncontrada = ganadoMemoria.find(a => (a.rp && String(a.rp) === String(animal.rp_madre)) || (a.nombre && a.nombre.toLowerCase() === nombreMadre.toLowerCase()));
  if (madreEncontrada) {
    boxMadre.onclick = () => abrirFichaAnimal(madreEncontrada);
  } else {
    boxMadre.onclick = null;
  }

  const savedPhoto = localStorage.getItem(`foto_${animal.id || animal.rp}`);
  const img = document.getElementById("ficha-img");
  const placeholder = document.getElementById("ficha-foto-placeholder");
  if (savedPhoto && img && placeholder) {
    img.src = savedPhoto;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else if (img && placeholder) {
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }

  renderGaleriaFotosSupabase();
  renderCrias();
  document.getElementById("modal-animal").classList.remove("hidden");
}

function cerrarFichaAnimal() {
  document.getElementById("modal-animal").classList.add("hidden");
  animalActual = null;
}

function guardarFotoAnimal(event) {
  const file = event.target.files[0];
  if (!file || !animalActual) return;
  const urlFoto = URL.createObjectURL(file);
  localStorage.setItem(`foto_${animalActual.id || animalActual.rp}`, urlFoto);
  
  const img = document.getElementById("ficha-img");
  const placeholder = document.getElementById("ficha-foto-placeholder");
  if (img && placeholder) {
    img.src = urlFoto;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  }
}

function agregarCria() {
  const inputCria = document.getElementById("nueva-cria-rp");
  if (!inputCria || !animalActual) return;
  const criaRp = inputCria.value.trim();
  if (!criaRp) return;
  
  let crias = JSON.parse(localStorage.getItem(`crias_${animalActual.id || animalActual.rp}`) || "[]");
  if (!crias.includes(criaRp)) {
    crias.push(criaRp);
    localStorage.setItem(`crias_${animalActual.id || animalActual.rp}`, JSON.stringify(crias));
  }
  
  inputCria.value = "";
  renderCrias();
}

function renderCrias() {
  if (!animalActual) return;
  const container = document.getElementById("ficha-crias-lista");
  if (!container) return;

  let crias = JSON.parse(localStorage.getItem(`crias_${animalActual.id || animalActual.rp}`) || "[]");
  if (crias.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No hay crías registradas para este animal.</p>`;
    return;
  }

  container.innerHTML = crias.map(c => {
    const animalCria = ganadoMemoria.find(a => a.rp && String(a.rp).toLowerCase() === String(c).toLowerCase());
    
    if (animalCria) {
      return `
        <div onclick='abrirFichaAnimal(${JSON.stringify(animalCria).replace(/'/g, "&#39;")})' class="bg-white p-2.5 rounded-lg border border-green-200 flex justify-between items-center cursor-pointer hover:bg-green-50 transition-colors shadow-sm">
          <div>
            <span class="font-extrabold text-green-900">RP: ${animalCria.rp}</span>
            <span class="text-xs text-gray-700 ml-2">(${animalCria.nombre || 'Sin nombre'})</span>
            <span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold ml-2">${animalCria.tipo || 'Propio'}</span>
          </div>
          <span class="text-xs text-blue-700 font-bold">Ver Ficha ➔</span>
        </div>`;
    } else {
      return `
        <div class="bg-white p-2.5 rounded-lg border flex justify-between items-center shadow-sm">
          <div>
            <span class="font-bold text-gray-800">Cría RP: ${c}</span>
            <span class="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold ml-2">Pendiente de inventario</span>
          </div>
        </div>`;
    }
  }).join("");
}

function renderServiciosToro() {
  if (!toroActual) return;
  const container = document.getElementById("toro-servicios-lista");
  if (!container) return;
  
  const nombreToro = (toroActual.nombre || "").toLowerCase().trim();
  const rpToro = String(toroActual.rp || "").toLowerCase().trim();

  const serviciosToro = serviciosMemoria.filter(s => {
    const tS = String(s.toro_utilizado || "").toLowerCase().trim();
    if (!tS) return false;
    return (nombreToro && tS.includes(nombreToro)) || (rpToro && tS.includes(rpToro));
  });

  if (serviciosToro.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No hay servicios registrados con este reproductor.</p>`;
    return;
  }

  container.innerHTML = serviciosToro.map(s => `
    <div class="bg-white p-2 rounded border flex justify-between items-center shadow-sm">
      <div>
        <span class="font-bold text-gray-800">Vaca RP: ${s.vaca_rp || 'N/D'}</span>
        <span class="text-xs text-gray-500 ml-2">Servicio: ${s.fecha_servicio || '-'}</span>
      </div>
      <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">FPP: ${s.fecha_parto_estimada || '-'}</span>
    </div>
  `).join("");
}

function actualizarFPP() {
  const inputFecha = document.getElementById("srv-fecha");
  const divFPP = document.getElementById("srv-fpp");
  if (!inputFecha || !divFPP) return;
  let f = inputFecha.value || new Date().toISOString().split("T")[0];
  const d = new Date(f + "T00:00:00");
  d.setDate(d.getDate() + 283);
  divFPP.innerText = d.toISOString().split("T")[0];
}

function guardarServicio(e) {
  e.preventDefault();
  const animalId = document.getElementById("srv-vaca-id").value;
  if (!animalId) return alert("Seleccioná una vaca de la lista.");
  let fechaServ = document.getElementById("srv-fecha").value || new Date().toISOString().split("T")[0];
  const fpp = calcularFPPStr(fechaServ);

  const servicio = {
    id: crypto.randomUUID(),
    animal_id: animalId,
    vaca_rp: document.getElementById("srv-vaca-sel").getAttribute("data-rp") || "",
    vaca_nombre: document.getElementById("srv-vaca-sel").getAttribute("data-nombre") || "",
    fecha_servicio: fechaServ,
    fecha_parto_estimada: fpp,
    tipo_servicio: document.getElementById("srv-tipo").value,
    toro_utilizado: document.getElementById("srv-toro").value,
    estado: "pendiente"
  };

  serviciosMemoria.push(servicio);
  localStorage.setItem("servicios_santa_candida", JSON.stringify(serviciosMemoria));
  alert("✅ Servicio guardado con éxito.");
  document.getElementById("form-servicio").reset();
  actualizarFPP();
  document.getElementById("srv-vaca-sel").innerText = "";
  renderizarServicios(serviciosMemoria);
}

function calcularFPPStr(fStr) {
  const d = new Date(fStr + "T00:00:00");
  d.setDate(d.getDate() + 283);
  return d.toISOString().split("T")[0];
}

function buscarVacaParaServicio() {
  const inputSearch = document.getElementById("srv-vaca-search");
  const res = document.getElementById("srv-vaca-results");
  if (!inputSearch || !res) return;
  const q = inputSearch.value.toLowerCase().trim();
  if (!q) return res.classList.add("hidden");

  const matches = ganadoMemoria.filter(a => {
    const rp = a.rp ? String(a.rp).toLowerCase() : "";
    const nombre = a.nombre ? String(a.nombre).toLowerCase() : "";
    return rp.includes(q) || nombre.includes(q);
  }).slice(0, 5);

  if (matches.length === 0) {
    res.innerHTML = `<div class="p-2 text-xs text-gray-500">No se encontraron animales.</div>`;
    res.classList.remove("hidden");
    return;
  }

  res.innerHTML = matches.map(a => `
    <div onclick="seleccionarVaca('${a.id}', '${a.rp}', '${a.nombre || ''}')" class="p-2 hover:bg-gray-100 cursor-pointer text-xs font-semibold flex justify-between">
      <span>RP: ${a.rp}</span>
      <span class="text-gray-500">${a.nombre || ''}</span>
    </div>
  `).join("");
  res.classList.remove("hidden");
}

function seleccionarVaca(id, rp, nombre) {
  document.getElementById("srv-vaca-id").value = id;
  const selEl = document.getElementById("srv-vaca-sel");
  selEl.innerText = `Seleccionada: RP ${rp} ${nombre}`;
  selEl.setAttribute("data-rp", rp);
  selEl.setAttribute("data-nombre", nombre);
  document.getElementById("srv-vaca-results").classList.add("hidden");
  document.getElementById("srv-vaca-search").value = "";
}

function renderizarServicios(lista) {
  const contenedor = document.getElementById("contenedor-servicios");
  if (!contenedor) return;
  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `<p class="text-xs text-gray-500 col-span-2 text-center py-4 bg-white rounded-xl shadow-sm">No hay servicios registrados.</p>`;
    return;
  }
  contenedor.innerHTML = lista.map(s => `
    <div class="p-4 rounded-xl border-l-4 shadow-sm bg-white border-l-blue-500">
      <h4 class="font-bold text-gray-900">Vaca RP: ${s.vaca_rp}</h4>
      <p class="text-xs text-gray-600">Toro: ${s.toro_utilizado || '-'}</p>
      <p class="text-xs text-blue-700 font-bold mt-1">FPP: ${s.fecha_parto_estimada}</p>
    </div>
  `).join("");
}