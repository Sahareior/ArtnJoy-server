const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json());

const port = process.env.PORT|| 5000

// art&craft KrLszqKj2aBRnNeL

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://artANDcraft:KrLszqKj2aBRnNeL@cluster0.j0rll9s.mongodb.net/?retryWrites=true&w=majority";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollections = client.db('carftANDartDB').collection('users')
    const instructorCollections = client.db('carftANDartDB').collection('instructor')
    const cartCollections = client.db('carftANDartDB').collection('carts')
    const classCollections = client.db('carftANDartDB').collection('AddedClasses')

    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const query = { email: newUser.email };
      
        const existingUser = await userCollections.findOne(query);
        if (existingUser) {
          res.send('Email already exists');
        } else {
          const result = await userCollections.insertOne(newUser);
          res.send(result);
        }
      });      

    app.get('/users', async(req,res)=>{
        const cursor =  userCollections.find()
        const result =await cursor.toArray()
        res.send(result)
    
    })
    // making admin 
    app.patch('/users/:id', async(req,res)=>{
      const id = req.params.id
      const data = req.body 
      
      const query = {_id: new ObjectId(id)}

      console.log(data)
      let updatedData

      if(data?.instructor ==="yes" || data?.instructor ==="no"){
         updatedData = {
          $set:{
            instructor: data.instructor
          }
        }
      }
      else{
        updatedData = {
          $set:{
            role: data.role
          }
        }
      }
      const result = await userCollections.updateOne(query,updatedData)
      res.send(result)
    })
    // ..........
    app.get('/instructors', async(req,res)=>{
        const cursor = instructorCollections.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    // add a class...............
    app.post('/class', async(req,res)=>{
      const data = req.body 
      const result = await classCollections.insertOne(data)
      res.send(result)
    })
    app.get('/class', async(req,res)=>{
      const cursor = classCollections.find()
      const result = await cursor.toArray()
      res.send(result)
    })
  app.patch('/class/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  
  const query = { _id: new ObjectId(id) };
  let updateData;

  if (data.data.length > 8) { // Check the length of data.data instead of data.length
    updateData = {
      $set: {
        feedback: data.data,
      },
    };
  } else {
    updateData = {
      $set: {
        status: data.data,
      },
    };
  }

  const result = await classCollections.updateOne(query, updateData);
  res.send(result);
});

    app.get('/class/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const results = await classCollections.find(query).toArray();
      res.send(results);
    });
    
    // ..........cart
    app.post('/cart', async(req,res)=>{
        const cart = req.body 
        const result = await cartCollections.insertOne(cart)
        res.send(result)

    })
    app.get('/cart', async(req,res)=>{
        const cursor = cartCollections.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('hii')
})
app.listen(port,()=>{
    console.log(`running on ${port}`)
})