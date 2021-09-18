const sqlite3 = require('sqlite3').verbose();

// open the database connection
let db = new sqlite3.Database('./Chance_the_Gardener.db');

//html
let Xs = ['10','20','30'];
let Ys = ['100','200','300'];
let Zs= ['1000','2000','3000'];
let x_coord = 1123;
let y_coord = 21231;
let z_coord = 3123123;

// construct the insert statement with multiple placeholders
// based on the number of rows
//let placeholders = Xs.map((X) => '(?)').join(',');
//let sql = 'INSERT INTO Move(X,Y,Z) VALUES ('+x_coord+','y_coord+','+z_coord+')';

let sql = 'insert into Move(X,Y,Z) values (100,200,300)';
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