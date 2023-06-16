const express = require('express')
const stripe = require('stripe')('sk_test_51NEo1rESJveeRr2D7C6p7latFyClahoQ1dj9pw2qLzm7D088AbwYkUkY4l3LIT9NPStLZseQMGOlUCqWxXJvRGwf00BQatOtqb');
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express()
app.use(cors())
app.use(express.json());
// const secret = '61bcd85b905e1553f039bfb036f5a4793bcab874f1752b481bdb9c9f52f134f8'

const port = process.env.PORT|| 5000

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  // console.log(authorization)
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];
  // console.log(token)

  jwt.verify(token, process.env.SECRET_CODE, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}
// art&craft KrLszqKj2aBRnNeL

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.j0rll9s.mongodb.net/?retryWrites=true&w=majority`;

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
     client.connect();
    const userCollections = client.db('carftANDartDB').collection('users')
    const instructorCollections = client.db('carftANDartDB').collection('instructor')
    const cartCollections = client.db('carftANDartDB').collection('carts')
    const classCollections = client.db('carftANDartDB').collection('AddedClasses')
    const paymentCollections = client.db('carftANDartDB').collection('payments')
    const studentCollections = client.db ('carftANDartDB').collection('students')
    const instructorList = client.db('carftANDartDB').collection('insList')
    const classesList =  client.db('carftANDartDB').collection('classes')



    
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_CODE, { expiresIn: '1h' })

      res.send({ token })
    })


    app.get('/classes',async (req,res)=>{
      const cursor = classesList.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/instructor',async (req,res)=>{
      const cursor = instructorList.find()
      const result = await cursor.toArray()
      res.send(result)
    })


    app.post('/users',  async (req, res) => {
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

    app.get('/users',verifyJWT, async(req,res)=>{
        const cursor =  userCollections.find()
        const result =await cursor.toArray()
        res.send(result)
    
    })

    app.get('/users/email/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      const query = { email: email};
      const result = await userCollections.find(query).toArray();
      res.send(result);
    });
    // making admin 
    app.patch('/users/:id', async(req,res)=>{
      const id = req.params.id
      const data = req.body 
      
      const query = {_id: new ObjectId(id)}

 
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
    app.put('/class/:id', async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const updatedData = req.body;
      const { name,image,cost, seats} = updatedData
     
      const data = {
        $set: {
          className: name,
           classImage : image,
            price:cost ,
             availableSeats:seats
        }
      }
      const result = await classCollections.updateOne(query,data,options)
      res.send(result)
  })
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

    app.get('/cart/:email', async(req,res)=>{
      const email = req.params.email 
      
      const query = {userEmail:email}
      const result = await cartCollections.find(query).toArray() 
      
      res.send(result)
    })

   
app.get('/cart/id/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartCollections.find(query).toArray();
  res.send(result);
});
    app.delete('/cart/id/:id', async(req,res)=>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await cartCollections.deleteOne(query)
      res.send(result)
    })


    app.post("/create-payment-intent", async (req, res) => {
      const {totalPrice} = req.body;
   
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice*100,
        
        currency: "usd",
        payment_method_types: [
        "card"
      ],
      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
     
    });
    app.post('/payment', async(req,res)=>{
      const data = req.body 
      
      const result = await paymentCollections.insertOne(data)
      res.send(result)
    })
    app.get('/payment/:email', async (req, res) => {
      const userEmail = req.params.email; // Retrieve the email parameter from the request
      
      const cursor = paymentCollections
        .find({ email: userEmail })
        .sort({ date: -1 }); // Sort by the "date" field in descending order
      
      const result = await cursor.toArray();
      const sortedResult = result.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.send(sortedResult);
    });
    
    
    

    app.post('/students', async (req, res) => {
      try {
        const data = req.body;
    
        // Check if the instructor already exists
        const existingData = await studentCollections.findOne({ instructor: data.instructor });
        if (existingData) {
          return res.status(409).json({ message: 'Instructor already exists' });
        }
    
        // Insert the new student data
        const result = await studentCollections.insertOne(data);
        res.send(result);
      } catch (error) {
        // Handle any error that occurs during the database operation
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
    app.get('/students', async(req,res)=>{
      const cursor = studentCollections.find()
      const result = await cursor.toArray()
      res.send(result)
  })
  app.patch('/students/:className', async (req, res) => {
    const className = req.params.className;
    const query = { className: className };
  
    try {
      const existingData = await studentCollections.findOne(query);
      if (!existingData) {
        // Handle the case when the data is not found
        return res.status(404).json({ message: 'Data not found' });
      }
  
      const currentStudentCount = existingData.student;
      const updatedData = {
        $set: {
          student: currentStudentCount + 1,
        },
      };
  
      const result = await studentCollections.updateOne(query, updatedData);
      res.json(result);
    } catch (error) {
      // Handle any error that occurs during the database operation
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
    


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