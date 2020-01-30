var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database.sqlite');
 
function init() => {
    db.run("CREATE TABLE playlist (user TEXT, uri TEXT)");
    db.run("CREATE TABLE history (user TEXT, uri TEXT)");
    db.run("CREATE TABLE order (user TEXT)");
}
function add(user, uri){
    db.get('')
}
function get(user){

}
function list(user){
    db.all('SELECT * FROM playlist WHERE')
}