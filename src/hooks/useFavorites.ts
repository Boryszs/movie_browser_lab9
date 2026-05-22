import { useCallback, useEffect, useMemo, useState } from "react";
import type { FavoriteMovie } from "../api/types";

const STORAGE_KEY = "movie-browser:favorites";

function loadFavorites() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as FavoriteMovie[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>(loadFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((movie) => movie.id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (movieId: number) => favoriteIds.has(movieId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((movie: FavoriteMovie) => {
    setFavorites((currentFavorites) => {
      const exists = currentFavorites.some(
        (favorite) => favorite.id === movie.id,
      );

      return exists
        ? currentFavorites.filter((favorite) => favorite.id !== movie.id)
        : [movie, ...currentFavorites];
    });
  }, []);

  const reorderFavorites = useCallback((nextFavorites: FavoriteMovie[]) => {
    setFavorites(nextFavorites);
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    reorderFavorites,
  };
}