require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Lista completa de los 9 toros de Select Debernardi listos para cargar
const torosData = [
  {
    nombre: "Caracho",
    hba: "845146",
    rp: "2105",
    fecha_nacimiento: "2017-08-13",
    peso_nacer: 36,
    peso_205d: 343,
    peso_ano: 600,
    peso_maduro: 980,
    frame: 4.1,
    circunferencia_escrotal: 40,
    pedigree: "Remixado x Bismarck x Final Dream",
    criador: "Cabaña Don José",
    propietario: "Cabaña Don José"
  },
  {
    nombre: "Remixado",
    hba: "831468",
    rp: "1717",
    fecha_nacimiento: "2015-01-01",
    peso_nacer: 28,
    peso_205d: 265,
    peso_ano: 580,
    peso_maduro: 989,
    frame: 4.7,
    circunferencia_escrotal: 43,
    pedigree: null,
    criador: "Cabaña Don José",
    propietario: "Cabaña Don José / Cabaña La Guagua"
  },
  {
    nombre: "Record",
    hba: "870459",
    rp: "579",
    fecha_nacimiento: "2020-08-08",
    peso_nacer: 34,
    peso_205d: 325,
    peso_ano: 630,
    peso_maduro: 1020,
    frame: 4.3,
    circunferencia_escrotal: 43,
    pedigree: "Reckoning x Yesquero x Perks Advance",
    criador: "Los Murmullos",
    propietario: "Cabaña El Cortijo de Campos de Torres"
  },
  {
    nombre: "Halcón",
    hba: "884763",
    rp: "8554",
    fecha_nacimiento: "2021-08-06",
    peso_nacer: 38,
    peso_205d: 321,
    peso_ano: 612,
    peso_maduro: 875,
    frame: 5.0,
    circunferencia_escrotal: 43,
    pedigree: "Prolijo x Quebrantador x Saugahatchee 3000",
    criador: "Cabaña La Rubeta",
    propietario: "Cabaña La Rubeta / Eaglehawk Angus"
  },
  {
    nombre: "Lúcuma",
    hba: "834939",
    rp: "4178",
    fecha_nacimiento: "2016-08-30",
    peso_nacer: 28,
    peso_205d: 195,
    peso_ano: 430,
    peso_maduro: 890,
    frame: 4.5,
    circunferencia_escrotal: 41,
    pedigree: "Paine x Iporazo x Helvion",
    criador: "Casamu S.A.",
    propietario: "Select Debernardi / Cab. La Esencia / Cab. La Maruca"
  },
  {
    nombre: "Napolitano",
    hba: "842678",
    rp: "449",
    fecha_nacimiento: "2017-07-25",
    peso_nacer: 35,
    peso_205d: 304,
    peso_ano: 620,
    peso_maduro: 980,
    frame: 4.0,
    circunferencia_escrotal: 44,
    pedigree: "Napoleon x Sirocco x Falta Envido",
    criador: "Cabaña Santa Rosa",
    propietario: "Cabaña Santa Rosa"
  },
  {
    nombre: "Precoz",
    hba: "847918",
    rp: "7951",
    fecha_nacimiento: "2017-12-11",
    peso_nacer: 33,
    peso_205d: 340,
    peso_ano: 745,
    peso_maduro: 935,
    frame: 4.9,
    circunferencia_escrotal: 43,
    pedigree: "Franco x Quebrantador x Sakic",
    criador: "Rubeta S.A.",
    propietario: "Rubeta S.A. / Milkland / Santa Cecilia Agrop. S.A. / Cab. Mis Amores"
  },
  {
    nombre: "Rufián",
    hba: "871775",
    rp: "963",
    fecha_nacimiento: "2020-09-01",
    peso_nacer: 33,
    peso_205d: 381,
    peso_ano: 480,
    peso_maduro: 820,
    frame: 3.4,
    circunferencia_escrotal: 41,
    pedigree: null,
    criador: "Cabaña Santa Rosa",
    propietario: "Cabaña Santa Rosa"
  },
  {
    nombre: "Rumi",
    hba: "867566",
    rp: "B326",
    fecha_nacimiento: "2018-08-09",
    peso_nacer: 31,
    peso_205d: 209,
    peso_ano: 584,
    peso_maduro: 894,
    frame: null,
    circunferencia_escrotal: 42,
    pedigree: "Lúcuma x Elunche",
    criador: "Casamu S.A.",
    propietario: "Casamu S.A. (Comercializa Select Debernardi)"
  }
];

// Función para registrar un animal buscando automáticamente a los padres por RP (si son propios)
async function registrarAnimalConGenealogia(datosAnimal) {
  let madreId = null;
  let padreId = null;

  console.log(`\n🐂 Registrando animal RP: ${datosAnimal.rp}...`);

  if (datosAnimal.rp_madre) {
    const { data: madre } = await supabase
      .from('ganado')
      .select('id, rp, nombre')
      .eq('rp', datosAnimal.rp_madre)
      .single();

    if (madre) {
      madreId = madre.id;
      console.log(`   🟢 Madre encontrada por RP ${madre.rp}: ${madre.nombre || 'Sin nombre'}`);
    } else {
      console.log(`   ⚠️ No se encontró una madre propia con el RP: ${datosAnimal.rp_madre}`);
    }
  }

  if (datosAnimal.rp_padre) {
    const { data: padre } = await supabase
      .from('ganado')
      .select('id, rp, nombre')
      .eq('rp', datosAnimal.rp_padre)
      .single();

    if (padre) {
      padreId = padre.id;
      console.log(`   🟢 Padre encontrado por RP ${padre.rp}: ${padre.nombre || 'Sin nombre'}`);
    } else {
      console.log(`   ⚠️ No se encontró un padre propio con el RP: ${datosAnimal.rp_padre}`);
    }
  }

  const { data, error } = await supabase
    .from('ganado')
    .insert([
      {
        establecimiento_id: datosAnimal.establecimiento_id,
        rp: datosAnimal.rp,
        nombre: datosAnimal.nombre || null,
        hba: datosAnimal.hba || null,
        madre_id: madreId,
        padre_id: padreId,
        es_externo: false
      }
    ])
    .select();

  if (error) {
    console.error('❌ Error al registrar el animal:', error.message);
  } else {
    console.log('✅ ¡Animal registrado y árbol genealógico vinculado con éxito!', data[0]);
  }
}

// Función masiva para cargar todos los toros de golpe en la tabla 'ganado'
async function cargarLoteToros(establecimientoId) {
  console.log('🚀 Iniciando carga masiva de toros...');
  
  // Mapeamos los datos al formato que espera tu tabla general
  const payload = torosData.map(toro => ({
    establecimiento_id: establecimientoId,
    rp: toro.rp,
    nombre: toro.nombre,
    hba: toro.hba,
    es_externo: true // Al ser toros externos de catálogo/select, los marcás como externos o ajustalo a false si son propios
  }));

  const { data, error } = await supabase
    .from('ganado')
    .insert(payload)
    .select();

  if (error) {
    console.error('❌ Error en la carga masiva:', error.message);
  } else {
    console.log(`✅ ¡Se cargaron exitosamente ${data.length} toros a la base de datos!`);
  }
}

// Si querés ejecutarlo directamente pasando tu UUID de establecimiento:
// cargarLoteToros('TU_ESTABLECIMIENTO_UUID_AQUI');

module.exports = { torosData, registrarAnimalConGenealogia, cargarLoteToros };