require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function probarConexion() {
  console.log('🔄 Conectando con Supabase...');
  
  const { data, error } = await supabase
    .from('establecimientos')
    .select('*');

  if (error) {
    console.error('❌ Error al conectar:', error.message);
  } else {
    console.log('\n✅ ¡Conexión exitosa! Establecimientos en la base de datos:');
    data.forEach(est => {
      console.log(`- 📍 ${est.nombre}`);
    });
  }
}

probarConexion();