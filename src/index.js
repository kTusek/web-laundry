import express from 'express';
import connect from './db.js';
import cors from 'cors';
import Auth from './auth.js';
import mongo from 'mongodb';

const app = express() 
const port = 3100;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname + '/../public/'));
app.get(/.*/, function(req,res){
    res.sendFile(__dirname + '/public/index.html');
})

//Registracija
app.post('/user', async (req , res) =>{
    let userData = req.body;
    let id;
    try{
        id = await Auth.registerUser(userData);
    }
    catch(e){
        res.status(500).json({ error: e.message });
    }

    res.json({ id:id })

});

//Dohvati sve korisnike
app.get('/users', async (req , res) =>{
    let db = await connect();
    let cursor = await db.collection('users').find({});
    let results = await cursor.toArray();
    res.json(results);
});

app.get('/secret', [Auth.verify], (req,res) => {
    res.json({message: "This is a secret" + req.jwt.email})
})

//Autenticiraj ukoliko već postoji korisnik
app.post('/login', async (req, res) =>{
    let user = await req.body;
    let userEmail = user.email 
    let userPassword = user.password 
    
    try{
       let authResult = await Auth.authenticateUser(userEmail, userPassword);
       res.json(authResult);
    }
    catch(e) {
        res.status(401).json({ error: e.message })
    }
})

app.post('/comment', async (req , res) =>{
    try{
    let commentData = req.body;
    let db = await connect();
	let result = await db.collection("comments").insertOne(commentData);
    res.json(result);
    }
    catch(e) {
        res.status(401).json({ error: e.message })
    }
});

app.get("/comments", async (req, res) => {
    let db = await connect();   
    let results = await db.collection("comments").find({}).toArray();
    console.log(results);
    res.json(results);
});

app.post('/laundry_data', async (req , res) =>{
    try{
    let laundryData = req.body;
    let db = await connect();
	let result = await db.collection("LaundryData").insertOne(laundryData);
    res.json(result);
    }
    catch(e) {
        res.status(401).json({ error: e.message })
    }
});

app.get("/laundry_data", async (req, res) => {
    let db = await connect();   
    let results = await db.collection("LaundryData").find({}).toArray();
    console.log(results);
    res.json(results);
});

app.get("/laundry_data/:user", async (req, res) => {
    let db = await connect();

    let currentUser = req.params.user;

    let results = await db.collection("LaundryData").find({ user: currentUser }).toArray();
    console.log("Results: ",results);
    res.json(results);
    
});

app.get("/comments/delete/:id", async (req, res) => {
	let id = req.params.id;
	let db = await connect();

	let result = await db.collection("comments").deleteOne({ _id: mongo.ObjectId(id) });

	if (result && result.deletedCount == 1) {
		res.json(result);
	} else {
		res.json({
			status: "fail",
		});
	}
});

app.listen(port, () => console.log(`Listening on port: ${port}!`))