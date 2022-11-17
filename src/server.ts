import{ AppDataSource } from "./data-source";
import { start } from "./jobs/jobs.entry";
import { app } from "../src/app";
const PORT = process.env.PORT || 3030;

AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
    start();
  })
  .catch((error) => {
    console.log("Failed to create connection with database...");
    console.log(error);
  });
