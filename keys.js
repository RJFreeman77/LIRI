console.log('this is loaded');

exports.spotify = {
  id: process.env.SPOTIFY_ID,
  secret: process.env.SPOTIFY_SECRET
};

exports.tmdb = {
  id: process.env.TMDB_KEY,
  example: "https://api.themoviedb.org/3/movie/550?api_key=aeea97d0c98f188bea6d3b4c4352d8ae",
}