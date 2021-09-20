const sqlite3 = require('sqlite3').verbose();

// open the database connection
let db = new sqlite3.Database('./Chance_the_Gardener.db');


let csv_file_path = 'plantdata';
let sql = 'insert into plant_details(file_path) values ("./plantdata.csv")';
// output the INSERT statement
console.log(sql);

db.run(sql, function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log(`Rows inserted ${this.changes}`);
});

// close the database connection
db.close();
