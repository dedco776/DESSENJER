// ========================================
// DESSENJER
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
  "https://itdbusdpkgcxyxzbfrjn.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGJ1c2Rwa2djeHl4emJmcmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzU0NjIsImV4cCI6MjEwMzI1MTQ2Mn0.rBOF9muR_S2xba_8x-6AObMOs7clvyleKG9c8TnZYAc";


// ========================================
// CHECK SUPABASE LIBRARY
// ========================================

if (
  typeof window.supabase === "undefined" ||
  typeof window.supabase.createClient !== "function"
) {

  console.error(
    "DESSENJER: Supabase library topilmadi."
  );

  throw new Error(
    "Supabase library yuklanmadi."
  );
}


// ========================================
// CREATE CLIENT
// ========================================

var supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ========================================
// MAKE GLOBAL
// ========================================

window.supabaseClient =
  supabaseClient;


// ========================================
// CONNECTION TEST
// ========================================

console.log(
  "DESSENJER: Supabase client tayyor."
);

console.log(
  "Supabase URL:",
  SUPABASE_URL
);
