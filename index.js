const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const Category = client.db('MyCarDatabase').collection('CategoryData')
        const Orders = client.db('MyCarDatabase').collection('Orders')

        app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await Orders.insertOne(order)
            res.send(result)
        })

        app.put('/bookings', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const docs = {
                $set: { booking: true }
            }
            const result = await CarsData.updateOne(filter, docs, option)
            res.send(result)
        })

        app.get('/category', async (req, res) => {
            const query = {}
            const result = await Category.find(query).toArray()
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Users.insertOne(user)
            res.send(result)
        })
        app.post('/cars', async (req, res) => {
            const data = req.body;
            const date = new Date()
            const query = {
                ...data,
                date,
            }
            const result = await CarsData.insertOne(query)
            res.send(result)
        })

        app.get('/cars/data/:id', async (req, res) => {
            const brand = req.params.id
            const query = {
                brand: brand
            }
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