export type Movie = {
  id: number;
  title: string,
  runtime: number,
  status: string,
  overview: string,
  tagline: string,
  actors: string[],
  genres: object[],
  releaseDate: Date,
  rating: number,
  poster: string,
  backdrop: string,
  background: string,
  seen?: boolean;
  next?: boolean;
  timestamp?: Date;
}