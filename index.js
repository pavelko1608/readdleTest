var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var Sequelize = require('sequelize');

var app = express();

//SQLITE CONNECTION
const sequelize = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: './test.sqlite'
});

//  SYNC SCHEMA
sequelize
  .sync({ force: true })
  .then(function(err) {
    console.log('It worked!');
  }, function (err) {
    console.log('An error occurred while creating the table:', err);
  });

//SEQUELIZE AUTHENTICATION
sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  }, function (err) {
    console.log('Unable to connect to the database:', err);
  });

//DEFINING MODELS  
const Company = sequelize.define('company', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },	
  name: {
  	allowNull: false,
    type: Sequelize.STRING,
    unique: true
  }
});

const User = sequelize.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },	
  name: {
  	allowNull: false,
    type: Sequelize.STRING,
    unique: true
  },
  age: {
  	allowNull: false,
	type: Sequelize.INTEGER
  }, 
  companyName: {
  	type: Sequelize.STRING
  }
});

//BODYPARSER MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

//VIEW ENGINE
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

// COMPANY ROUTES
app
	.get("/", function(req, res) {
		Company.findAll().then(results => {
  			res.render("index", {companies: results})
		})
	})
	.get("/api/company/:id", function(req, res) {
		Company.findOne({where: {id: req.params.id}}).then(company => {
			User.findAll({where: {companyName: company.name}}).then(users => {
				res.render("company", {company: company, users: users})
			})
		})
	})
	.get("/api/createCompany", function(req, res) {
		res.render("createCompany")
	})
	.post("/api/createCompany", function(req, res) {
		if(req.body.name) {
		Company.create({name: req.body.name}).then(company => {
			company.save()
		})
		res.redirect("/")
		}
		else{
			res.redirect("/api/createCompany")
		}
	})

	.get("/api/updateCompany/:id", function(req, res) {
		Company.findOne({where: {id: req.params.id}}).then(company => {
			res.render("updateCompany", {company: company})
		})
	})
	.post("/api/updateCompany/:id", function(req, res) {
		if(req.body.name) {
			Company.findOne({ where: {id: req.params.id}}).then(company => {
				company.update({name: req.body.name})
			})
			res.redirect("/")
		} else {
			res.redirect("/api/updateCompany/" + req.params.id)
		}
	})
	.post("/api/deleteCompany/:id", function(req, res) {
		Company.findOne({ where: {id: req.params.id}}).then(company => {
			company.destroy()
		})
		res.redirect("/")
	})
	.get("/companies.json", function(req, res) {
		Company.findAll().then(results => {
			res.json(results)
		})
	})

// USER ROUTES
app
	.get("/api/users", function(req, res) {
		User.findAll().then(users => {
				res.render("users", {users: users})
		})
	})
	.get("/api/user/:id", function(req, res) {
		User.findOne({where: {id: req.params.id}}).then(user => {
				res.render("user", {user: user})
		})
	})
	.get("/api/createUser", function(req, res) {
		res.render("createUser")
	})
	.post("/api/createUser", function(req, res) {
		if(req.body.name) {
				Company.findOrCreate({where: {name: req.body.companyName}}).then(company => {
					User.create({name: req.body.name, age: req.body.age, companyName: req.body.companyName}).then(user => {
						user.save()
					})
					res.redirect("/api/users")
				})
			
		} else {
		  	res.redirect("/api/createUser")
		  }
	})

	.get("/api/updateUser/:id", function(req, res) {
		User.findOne({where: {id: req.params.id}}).then(user => {
			res.render("updateUser", {user: user})
		})
	})
	.post("/api/updateUser/:id", function(req, res) {
		if(req.body.name) {
			User.findOne({ where: {id: req.params.id}}).then(user => {
				Company.findOrCreate({where: {name: req.body.companyName}}).then(company => {
					user.update({name: req.body.name, age: req.body.age, companyName: req.body.companyName}).then(user => {
						user.save()
						res.render("user", {user: user})
					})
				})
			})
			
		} else {
			res.redirect("/api/updateUser/" + req.params.id)
		}
	})
	.post("/api/deleteUser/:id", function(req, res) {
		User.findOne({ where: {id: req.params.id}}).then(user => {
			user.destroy()
		})
		res.redirect("/api/users")
	})	
	.get("/users.json", function(req, res) {
		User.findAll().then(results => {
			res.json(results)
		})
	})


//SET PORT
app.set("port", (process.env.PORT || 3000));
app.listen(app.get("port"), function() {
	console.log("Server started on port" + app.get("port"));
})





