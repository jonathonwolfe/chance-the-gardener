const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./Chance_the_Gardener.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the "Chance the Gardener" database.');
});

db.serialize(() => {
  db.each(`SELECT Move_ID as ID,
                  X,
                  Y,
                  Z
           FROM Move`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.ID + "\t" + row.X+"-"+row.Y+"-"+row.Z);
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});