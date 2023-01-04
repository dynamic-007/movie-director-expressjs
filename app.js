const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

function converttoobj(arr) {
  return {
    movieId: arr.movie_id,
    directorId: arr.director_id,
    movieName: arr.movie_name,
    leadActor: arr.lead_actor,
  };
}

app.get("/movies/", async (request, response) => {
  let query = `select movie_name from movie`;
  let arr = await db.all(query);
  arr = arr.map((each) => {
    return {
      movieName: each.movie_name,
    };
  });
  response.send(arr);
});

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;

  let query = `insert into movie(director_id,movie_name,lead_actor) values
    (${directorId},'${movieName}','${leadActor}')`;
  let arr = await db.run(query);

  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const query = `select * from movie where movie_id = ${movieId};`;
  const arr = await db.get(query);

  response.send(converttoobj(arr));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  let query = `update movie set director_id=${directorId},
  movie_name='${movieName}', lead_actor ='${leadActor}' where
  movie_id= ${movieId};`;
  let arr = await db.run(query);

  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  let query = `delete from movie where movie_id = ${movieId};`;
  let arr = await db.run(query);

  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let query = `select * from director`;
  let arr = await db.all(query);
  arr = arr.map((each) => {
    return {
      directorId: each.director_id,
      directorName: each.director_name,
    };
  });
  response.send(arr);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  let query = `select movie_name from movie where director_id = ${directorId}`;
  let arr = await db.all(query);
  arr = arr.map((each) => {
    return {
      movieName: each.movie_name,
    };
  });
  response.send(arr);
});

module.exports = app;
