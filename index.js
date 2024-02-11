const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middlewares
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send("Server is running")
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8yk5up.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // database collections
    const taskCollection = client.db("Tasking").collection("tasks");
    const userCollection = client.db("Tasking").collection("users");
    // api for posting tasks on db
    app.post('/tasks', async (req, res) => {
      const taskData = req.body;
      const result = await taskCollection.insertOne(taskData);
      res.send(result)
    })

    app.get('/tasks/:email', async (req, res) => {
      const query = { userEmail: req.params.email }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/tasks/:email/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id), userEmail: req.params.email }
      const result = await taskCollection.findOne(query);
      res.send(result)
    })

    // api for deleting tasks
    app.delete('/tasks/:email/:id', async (req, res) => {
      const query = { userEmail: req.params.email, _id: new ObjectId(req.params.id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

    // api for updating task status
    app.patch('/tasks/:email/:id', async (req, res) => {
      const query = { userEmail: req.params.email, _id: new ObjectId(req.params.id) };
      const updates = req.body;
      const updateDoc = {
        $set: updates
      }
      const result = await taskCollection.updateOne(query, updateDoc);
      res.send(result);
    })

    // ap for posting users data to DB
    app.post('/users', async (req, res) => {
      const userData = req.body;
      const query = { email: userData.email }
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        return res.send({ message: "This user is already exist in DB", insertedID: null })
      }
      const result = await userCollection.insertOne(userData);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!, port:", port);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log("server is running on port: ", port);
})