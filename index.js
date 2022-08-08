const fecha = require("fecha");
const express = require("express");
const notFound = (req, res) => res.status(404).send("Route does not exist");
const router = require("./routes/dashboardRoutes");
const app = express();
app.use("/api", router);

app.use(notFound);

port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
// node native promisify
// const query = util.promisify(connection.query).bind(connection);

// const getBadges = async () => {
//   try {
//     const rows = await query(`select *  from pointage  `);
//     const useful = rows.map((element) => [
//       element["date_de_deplacement"],
//       element["TYPE"],
//     ]);
//     //let k = JSON.parse(JSON.stringify(rows));

//     const tt = rows.map((e) => {
//       let k = new Object();
//       k.date_de_deplacement = e["date_de_deplacement"];
//       k.TYPE = e["TYPE"];
//       return k;
//     });
//     tt.sort(
//       (a, b) =>
//         new Date(a.date_de_deplacement) - new Date(b.date_de_deplacement)
//     );

//     const l = new Date();
//     console.log(l);
//     return rows;
//   } finally {
//     connection.end();
//   }
// };

// (async () => {
//   const k = await getBadges();
//   // console.log(k);
// })();

// connection.connect((err) => {
//   if (err) throw err;
//   console.log("Connected!");
// });

// connection.query("select * from pointage", (err, rows) => {
//   if (err) throw err;
//   // console.log(rows);
//   const result = rows.map((element) => {
//     // let tmp = fecha.parse("10-12-10 14:11:12", "YY-MM-DD HH:mm:ss");
//     try {
//       const tmp = new Date(element["date_de_deplacement"]);
//       const timee = fecha.format(tmp, " HH:mm");
//       return timee;
//     } catch (e) {
//       console.log("hello");
//       return;
//     }
//   });
// });

// const showPresence = async (duration) => {
//   if (typeof duration === "Date") {
//   } else {
//     switch (duration) {
//       case "day":
//         break;
//       case "week":
//         break;
//       case "month":
//         break;

//       default:
//         break;
//     }
//   }
// };

// The connection is terminated gracefully
// Ensures all remaining queries are executed
// Then sends a quit packet to the MySQL server.
