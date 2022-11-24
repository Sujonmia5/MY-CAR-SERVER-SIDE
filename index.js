const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Server is running')
})

const uri = `${process.env.DBURL}`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const Users = client.db('MyCarDatabase').collection('users')
        const CarsData = client.db('MyCarDatabase').collection('carsData')
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Users.insertOne(user)
            res.send(result)
        })

        app.get('/cars/data/:id', async (req, res) => {
            const categoryId = parseInt(req.params.id)
            const query = {
                Category_id: categoryId
            }
            console.log(query);

            const result = await CarsData.find(query).toArray()
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(() => { })


app.listen(port, () => {
    console.log('Server is running on', port);
})