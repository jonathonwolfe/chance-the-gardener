const sqlite3 = require('sqlite3').verbose();

// open the database connection
let db = new sqlite3.Database('./Chance_the_Gardener.db');

//html

// construct the insert statement with multiple placeholders
// based on the number of rows
//let placeholders = Xs.map((X) => '(?)').join(',');
//let sql = 'INSERT INTO Move(X,Y,Z) VALUES ('+x_coord+','y_coord+','+z_coord+')';
email = "'ads@asd.com'";
password= "'asdadsa'";

let sql = 'insert into User(Email,Password) values ('+email+','+ password+')';

//let sql = 'insert into User(Email,Password) values (123,432)';
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
