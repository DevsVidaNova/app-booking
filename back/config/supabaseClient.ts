import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não estão definidas.');
    process.exit(1); 
  }
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
async function testConnection() {
    try {
        const { error } = await supabase.from('user_profiles').select('*').limit(1);
        if (error) {
            throw new Error(error.message);
        }
    } catch (err: any) {
        console.error('Erro ao conectar com o Supabase:', err.message);
    }
}

testConnection();

export default supabase;
