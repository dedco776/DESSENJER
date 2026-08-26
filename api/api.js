// ========================================
// DESSENJER
// SUPABASE API CONNECTION
// ========================================


// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
  "https://itdbusdpkgcxyxzbfrjn.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGJ1c2Rwa2djeHl4emJmcmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzU0NjIsImV4cCI6MjEwMzI1MTQ2Mn0.rBOF9muR_S2xba_8x-6AObMOs7clvyleKG9c8TnZYAc";


// ========================================
// SUPABASE CLIENT
// ========================================

if (!window.supabase) {

  throw new Error(
    "Supabase kutubxonasi yuklanmadi."
  );

}


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ========================================
// CONNECTION CHECK
// ========================================

console.log(
  "DESSENJER: Supabase ulandi."
);
