import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "./StarRating";
import { useMovies, useMovie } from "./useMovies";

const API_KEY = "19c5dfa";
const BASE_URL = "https://www.omdbapi.com/?";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [watched, setWatched] = useState(function () {
    const data = localStorage.getItem("watched");
    if (!data) return [];
    return JSON.parse(data);
  });
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  const [selectedMovieID, setSelectedMovieID] = useState(null);

  const { movies, setMovies, isLoading, errorMessage } = useMovies(query);

  function handleSelectMovie(movieID) {
    setSelectedMovieID(movieID);
  }

  function handleCloseSelectedMovie() {
    setSelectedMovieID(null);
  }

  function handleAddWatchedMovie(movie) {
    if (watched.some((mov) => mov.id === movie.id)) return;
    setWatched((watched) => [...watched, movie]);
    handleCloseSelectedMovie();
  }

  function handleRemoveWatchedMovie(movieID) {
    setWatched((watched) => watched.filter((movie) => movie.id !== movieID));
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      {/* <ToastContainer /> */}
      <NavBar>
        <Logo />
        <SearchBar
          query={query}
          setQuery={setQuery}
          onCloseSelectedMovie={handleCloseSelectedMovie}
          setMovies={setMovies}
        />
        <SearchResultStats movies={movies} />
      </NavBar>
      <Main>
        <Box isOpen={isOpen1} setIsOpen={setIsOpen1}>
          {isLoading && <Message>Data is loading...</Message>}
          {errorMessage && <Message>{errorMessage}</Message>}
          {!isLoading && (
            <MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
        </Box>
        <Box isOpen={isOpen2} setIsOpen={setIsOpen2}>
          {selectedMovieID ? (
            <MovieDetails
              selectedMovieID={selectedMovieID}
              onCloseSelectedMovie={handleCloseSelectedMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <MyMoviesSummary watched={watched} />
              <MyMoviesList
                watched={watched}
                onRemoveWatchedMovie={handleRemoveWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar({ query, setQuery, onCloseSelectedMovie, setMovies }) {
  useEffect(function () {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      onCloseSelectedMovie();
      setMovies([]);
    });
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function SearchResultStats({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children, isOpen, setIsOpen }) {
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.id} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.id)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedMovieID,
  onCloseSelectedMovie,
  onAddWatchedMovie,
  watched,
}) {
  const [userRating, setUserRating] = useState(0);
  const [movie, isLoading] = useMovie(selectedMovieID, formatMovieData);

  const {
    id,
    title,
    poster,
    year,
    runtime,
    genre,
    imdbRating,
    plot,
    actors,
    director,
  } = movie;
  const showAddButton = watched.some((watchedMovie) => watchedMovie.id === id);

  function formatMovieData(data) {
    return {
      id: data.imdbID,
      title: data.Title,
      poster: data.Poster,
      year: data.Year,
      runtime: data.Runtime,
      genre: data.Genre,
      imdbRating: data.imdbRating,
      plot: data.Plot,
      actors: data.Actors,
      director: data.Director,
    };
  }

  useEffect(
    function () {
      document.title = `usePopcorn | ${title}`;
    },
    [title]
  );

  return isLoading ? (
    <Message>Loading...</Message>
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseSelectedMovie}>
          ←
        </button>
        <img src={poster} alt="Poster" />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {year} - {runtime}
          </p>
          <p>{genre}</p>
          <p>⭐️ {imdbRating} IMDb rating</p>
        </div>
      </header>
      <section>
        {showAddButton || (
          <div className="rating">
            <StarRating
              handleSelectRatingValue={(selectedRating) =>
                setUserRating(selectedRating)
              }
              fontSize="25px"
            />

            <button
              className="btn-add"
              onClick={() => {
                const runtimeNumberOnly = Number(runtime.split(" ")[0]);
                onAddWatchedMovie({
                  ...movie,
                  userRating,
                  runtime: runtimeNumberOnly,
                });
              }}
            >
              + Add to List
            </button>
          </div>
        )}
        <p>{plot}</p>
        <p>Staring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

function MyMoviesSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(1);
  const avgUserRating = average(
    watched.map((movie) => movie.userRating)
  ).toFixed(1);
  const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(1);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function MyMoviesList({ watched, onRemoveWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.id}
          onRemoveWatchedMovie={onRemoveWatchedMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onRemoveWatchedMovie }) {
  return (
    <li key={movie.id}>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onRemoveWatchedMovie(movie.id)}
        >
          -
        </button>
      </div>
    </li>
  );
}
function Message({ children }) {
  return <p className="loader">{children}</p>;
}
