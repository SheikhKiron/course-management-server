const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// MongoDB URI
const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DB_PASS}@cluster0.2gqzmaz.mongodb.net/?appName=Cluster0`;

app.use(cors());
app.use(express.json());

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});



async function run() {
  try {
    // await client.connect();
    const myDB = client.db('myDB');
    const courseCollection = myDB.collection('courseCollection');

    console.log('MongoDB connected successfully!');


    app.get('/courses', async (req, res) => {
      const search = req.query.search || '';
      const query = search ? { title: { $regex: search, $options: 'i' } } : {};

      const result = await courseCollection.find(query).toArray();
      res.send(result);
    });

  
    app.get('/courses/:id', async (req, res) => {
      const { id } = req.params;
      const course = await courseCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(course);
    });


    app.post('/courses', async (req, res) => {
      const course = req.body;
      // course = {title, desc, email}
      const result = await courseCollection.insertOne(course);
      res.send(result);
    });


app.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, ...updatedData } = req.body;

    if (!ObjectId.isValid(id))
      return res.status(400).send({ message: 'Invalid course ID' });

    const course = await courseCollection.findOne({ _id: new ObjectId(id) });
    if (!course) return res.status(404).send({ message: 'Course not found!' });

    if (!email || course.email !== email) {
      return res
        .status(403)
        .send({ message: 'Forbidden: You are not the owner!' });
    }

   
    const result = await courseCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send({ message: 'Course updated successfully!', result });
  } catch (err) {
    console.error('Error updating course:', err);
    res
      .status(500)
      .send({ message: 'Internal Server Error', error: err.message });
  }
});

    app.delete('/courses/:id', async (req, res) => {
      const { id } = req.params;
      const email = req.query.email;

      const course = await courseCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!course) {
        return res.status(404).send({ message: 'Course not found!' });
      }

   
      if (course.email !== email) {
        return res
          .status(403)
          .send({ message: 'Forbidden: You cannot delete this course!' });
      }

      const result = await courseCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
  } 
  catch {
    
  }
}

run().catch(console.dir);

// Server Listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
