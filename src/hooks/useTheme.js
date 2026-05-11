// src/hooks/useTheme.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  // Bersihin localStorage theme lama (biar gak nyumbat)
  useEffect(() => {
    // Hapus semua key theme lama yang gak dipake
    const keysToRemove = ['majumoney_theme', 'majumoney_theme_fast', 'majumoney_theme_temp', 'majumoney_theme_cache'];
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Cleaned up old localStorage key: ${key}`);
      }
    });
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      // 🔥 GUEST MODE (belum login) - pake system preference
      if (!user) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const defaultTheme = prefersDark ? "dark" : "light";
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
        setLoading(false);
        return;
      }

      // 🔥 USER LOGGED IN - ambil dari Supabase
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("theme")
          .eq("user_id", user.id)  // ✅ PAKAI USER_ID, BUKAN ID=1
          .maybeSingle();

        if (error) {
          console.error("Failed to load theme from Supabase:", error.message);
          // Fallback ke light
          setTheme("light");
          applyTheme("light");
        } else if (data?.theme) {
          setTheme(data.theme);
          applyTheme(data.theme);
        } else {
          // Belum ada settings, pake default light
          setTheme("light");
          applyTheme("light");
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
        setTheme("light");
        applyTheme("light");
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, [user]);  // 🔥 Re-run kalo user berubah (login/logout)

  const applyTheme = (newTheme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);

    // 🔥 GUEST MODE: gak usah simpan ke Supabase, cuma update UI
    if (!user) {
      console.log("Guest mode: theme changed to", newTheme, "(not saved to Supabase)");
      return;
    }

    // 🔥 USER LOGGED IN: simpan ke Supabase
    const { error } = await supabase
      .from("user_settings")
      .update({ theme: newTheme })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to save theme to Supabase:", error.message);
    } else {
      console.log("✅ Theme saved to Supabase:", newTheme);
    }
  };

  return { theme, toggleTheme, loading };
}