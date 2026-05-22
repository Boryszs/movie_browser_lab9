import { motion, Reorder } from "framer-motion";
import type { Variants } from "framer-motion";
import type { FavoriteMovie, MovieGenre, MovieSummary } from "../api/types";
import { MovieCard } from "./MovieCard";

type Movie = MovieSummary | FavoriteMovie;

type MovieGridProps = {
  movies: Movie[];
  genresById: Map<number, MovieGenre>;
  isFavorite: (movieId: number) => boolean;
  onOpenDetails: (movieId: number) => void;
  onToggleFavorite: (movie: Movie) => void;
  dimmed?: boolean;
  onReorder?: (movies: Movie[]) => void;
};

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function MovieGrid({
  movies,
  genresById,
  isFavorite,
  onOpenDetails,
  onToggleFavorite,
  dimmed = false,
  onReorder,
}: MovieGridProps) {
  const className = onReorder
    ? `movie-list ${dimmed ? "dimmed" : ""}`
    : `movie-grid ${dimmed ? "dimmed" : ""}`;

  const renderMovieCard = (movie: Movie) => (
    <MovieCard
      movie={movie}
      genresById={genresById}
      isFavorite={isFavorite(movie.id)}
      onOpenDetails={onOpenDetails}
      onToggleFavorite={onToggleFavorite}
    />
  );

  if (onReorder) {
    return (
      <Reorder.Group
        as="div"
        axis="y"
        values={movies}
        onReorder={onReorder}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie) => (
          <Reorder.Item
            as="div"
            key={movie.id}
            value={movie}
            variants={itemVariants}
            layout
          >
            {renderMovieCard(movie)}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    );
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {movies.map((movie) => (
        <motion.div key={movie.id} variants={itemVariants} layout>
          {renderMovieCard(movie)}
        </motion.div>
      ))}
    </motion.div>
  );
}

// import { motion, Reorder } from "framer-motion";
// import type { Variants } from "framer-motion";
// import type { FavoriteMovie, MovieGenre, MovieSummary } from "../api/types";
// import { MovieCard } from "./MovieCard";

// type Movie = MovieSummary | FavoriteMovie;

// type MovieGridProps = {
//   movies: Movie[];
//   genresById: Map<number, MovieGenre>;
//   isFavorite: (movieId: number) => boolean;
//   onOpenDetails: (movieId: number) => void;
//   onToggleFavorite: (movie: Movie) => void;
//   dimmed?: boolean;

//   /**
//    * Jeśli przekażesz onReorder, siatka włączy drag & drop.
//    * Jeśli nie przekażesz, działa zwykła animacja stagger.
//    */
//   onReorder?: (movies: Movie[]) => void;
// };

// const containerVariants: Variants = {
//   hidden: {
//     opacity: 0,
//   },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.08,
//     },
//   },
// };

// const itemVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 20,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//   },
// };



// export function MovieGrid({
//   movies,
//   genresById,
//   isFavorite,
//   onOpenDetails,
//   onToggleFavorite,
//   dimmed = false,
//   onReorder,
// }: MovieGridProps) {
//   const className = `movie-grid ${dimmed ? "dimmed" : ""}`;

//   const renderMovieCard = (movie: Movie) => (
//     <MovieCard
//       movie={movie}
//       genresById={genresById}
//       isFavorite={isFavorite(movie.id)}
//       onOpenDetails={onOpenDetails}
//       onToggleFavorite={onToggleFavorite}
//     />
//   );

//   if (onReorder) {
//     return (
//       <Reorder.Group
//         as="div"
//         axis="y"
//         values={movies}
//         onReorder={onReorder}
//         className={className}
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         {movies.map((movie) => (
//           <Reorder.Item
//             as="div"
//             key={movie.id}
//             value={movie}
//             variants={itemVariants}
//             layout
//           >
//             {renderMovieCard(movie)}
//           </Reorder.Item>
//         ))}
//       </Reorder.Group>
//     );
//   }

//   return (
//     <motion.div
//       className={className}
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       {movies.map((movie) => (
//         <motion.div key={movie.id} variants={itemVariants} layout>
//           {renderMovieCard(movie)}
//         </motion.div>
//       ))}
//     </motion.div>
//   );
// }
// import type { FavoriteMovie, MovieGenre, MovieSummary } from '../api/types'
// import { MovieCard } from './MovieCard'

// type MovieGridProps = {
//   movies: Array<MovieSummary | FavoriteMovie>
//   genresById: Map<number, MovieGenre>
//   isFavorite: (movieId: number) => boolean
//   onOpenDetails: (movieId: number) => void
//   onToggleFavorite: (movie: MovieSummary | FavoriteMovie) => void
//   dimmed?: boolean
// }

// export function MovieGrid({
//   movies,
//   genresById,
//   isFavorite,
//   onOpenDetails,
//   onToggleFavorite,
//   dimmed = false,
// }: MovieGridProps) {
//   return (
//     <div className={`movie-grid ${dimmed ? 'dimmed' : ''}`}>
//       {movies.map((movie) => (
//         <MovieCard
//           key={movie.id}
//           movie={movie}
//           genresById={genresById}
//           isFavorite={isFavorite(movie.id)}
//           onOpenDetails={onOpenDetails}
//           onToggleFavorite={onToggleFavorite}
//         />
//       ))}
//     </div>
//   )
// }
