require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Función para registrar servicio buscando al animal por su RP
async function registrarServicioPorRP(rpAnimal, fechaServicioStr, tipoServicio = 'IA') {
  console.log(`\n🔍 Buscando animal con RP: ${rpAnimal}...`);

  // 1. Buscar el ID interno del animal usando su RP
  const { data: animal, error: errorAnimal } = await supabase
    .from('ganado')
    .select('id, rp, nombre')
    .eq('rp', rpAnimal)
    .single();

  if (errorAnimal || !animal) {
    console.error(`❌ No se encontró ningún animal con el RP: ${rpAnimal}`);
    return;
  }

  console.log(`✅ ¡Encontrado! Animal: ${animal.nombre || 'Sin nombre'} (RP: ${animal.rp})`);

  // 2. Calcular los 283 días exactos de gestación en ganado Angus
  const fechaServicio = new Date(fechaServicioStr);
  const diasGestacion = 283;
  const fechaPartoEstimada = new Date(fechaServicio);
  fechaPartoEstimada.setDate(fechaServicio.getDate() + diasGestacion);

  console.log(`📅 Fecha de servicio: ${fechaServicio.toISOString().split('T')[0]}`);
  console.log(`🎯 Fecha estimada de parto (283 días): ${fechaPartoEstimada.toISOString().split('T')[0]}`);

  // 3. Guardar el servicio en la tabla 'servicios' usando el UUID correcto del animal
  const { data, error } = await supabase
    .from('servicios')
    .insert([
      {
        animal_id: animal.id,
        fecha_servicio: fechaServicio.toISOString().split('T')[0],
        tipo_servicio: tipoServicio,
        fecha_parto_estimada: fechaPartoEstimada.toISOString().split('T')[0],
        estado: 'pendiente'
      }
    ])
    .select();

  if (error) {
    console.error('❌ Error al registrar el servicio:', error.message);
  } else {
    console.log('✅ ¡Servicio guardado con éxito vinculado al RP:', rpAnimal, '!');
  }
}

// Probá ejecutando con el RP de un animal que tengas cargado en la base:
// registrarServicioPorRP('123', '2026-10-24', 'IA');