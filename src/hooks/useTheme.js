// src/hooks/useTheme.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useTheme() {
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("theme")
          .eq("id", 1)
          .maybeSingle();

        if (data?.theme) {
          setTheme(data.theme);
          applyTheme(data.theme);
        } else {
          // Fallback ke system preference
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          const defaultTheme = prefersDark ? "dark" : "light";
          setTheme(defaultTheme);
          applyTheme(defaultTheme);
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

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

    // Update ke Supabase (async, gak usah nunggu)
    try {
      await supabase.from("user_settings").update({ theme: newTheme }).eq("id", 1);
    } catch (err) {
      console.warn("Failed to sync theme to Supabase:", err);
    }
  };

  return { theme, toggleTheme, loading };
}