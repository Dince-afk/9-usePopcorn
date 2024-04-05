import { useEffect, useState } from "react";

const API_KEY = "19c5dfa";
const BASE_URL = "https://www.omdbapi.com/?";

function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(
    function () {
      //   setSelectedMovieID(null);
      if (query.length <= 2) {
        setMovies([]);
        setErrorMessage("");
        return;
      }
      const controller = new AbortController();
      async function fetchMovies() {
        setIsLoading(true);
        setErrorMessage("");
        try {
          const response = await fetch(
            `${BASE_URL}apikey=${API_KEY}&s=${query}`,
            { signal: controller.signal }
          );
          const data = await response.json();
          if (!data.Search) throw new Error("No movies found");
          const movieResults = data.Search.map((movie) => {
            return {
              title: movie.Title,
              year: movie.Year,
              id: movie.imdbID,
              poster: movie.Poster,
            };
          });
          setMovies(() => movieResults);
        } catch (err) {
          if (err.message === "No movies found") {
            setErrorMessage("No movies found");
            setMovies([]);
          } else if (err.name === "AbortError") return;
          else {
            console.error(err.name, err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovies();

      return () => controller.abort();
    },
    [query]
  );

  return { movies, setMovies, isLoading, errorMessage };
}

function useMovie(selectedMovieID, formatMovieData) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      setIsLoading(true);
      async function fetchMovie() {
        try {
          const response = await fetch(
            `${BASE_URL}apikey=${API_KEY}&i=${selectedMovieID}`
          );
          const data = await response.json();
          setMovie(formatMovieData(data));
        } catch (err) {
          console.error(err.name, err.message);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovie();
    },
    [selectedMovieID]
  );

  return [movie, isLoading];
}

export { useMovies, useMovie };
