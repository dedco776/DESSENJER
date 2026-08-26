// ========================================
// DESSENJER
// SUPABASE API CONNECTION
// ========================================

(function () {

  "use strict";

  // ========================================
  // SUPABASE CONFIG
  // ========================================

  const SUPABASE_URL =
    "https://itdbusdpkgcxyxzbfrjn.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGJ1c2Rwa2djeHl4emJmcmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzU0NjIsImV4cCI6MjEwMzI1MTQ2Mn0.rBOF9muR_S2xba_8x-6AObMOs7clvyleKG9c8TnZYAc";


  // ========================================
  // CHECK SUPABASE LIBRARY
  // ========================================

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {

    console.error(
      "DESSENJER: Supabase kutubxonasi yuklanmadi."
    );

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
        <div
          style="
            position:fixed;
            top:0;
            left:0;
            right:0;
            z-index:99999;
            padding:16px;
            background:#7f1d1d;
            color:white;
            font-family:Arial,sans-serif;
            text-align:center;
          "
        >
          Supabase kutubxonasi yuklanmadi.
          Internet aloqasini tekshiring.
        </div>
      `
    );

    return;
  }


  // ========================================
  // CREATE SUPABASE CLIENT
  // ========================================

  try {

    const client =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );


    // Juda muhim:
    // app.js shu nom orqali Supabase'ni ishlatadi.

    window.supabaseClient = client;


    console.log(
      "DESSENJER: Supabase ulandi."
    );


  } catch (error) {

    console.error(
      "DESSENJER: Supabase client yaratishda xato:",
      error
    );

    document.body.insertAdjacentHTML(
      "afterbegin",
      `
        <div
          style="
            position:fixed;
            top:0;
            left:0;
            right:0;
            z-index:99999;
            padding:16px;
            background:#7f1d1d;
            color:white;
            font-family:Arial,sans-serif;
            text-align:center;
          "
        >
          Supabase ulanishida xatolik.
        </div>
      `
    );

  }

})();
