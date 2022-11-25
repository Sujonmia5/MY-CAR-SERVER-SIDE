const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const JWT = require('jsonwebtoken')
require('dotenv').config()


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Server is running')
})

const uri = `${process.env.DBURL}`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function verifyToken(req, res, next) {

}

async function run() {
    try {
        const UsersCollection = client.db('MyCarDatabase').collection('users')
        const CarsCollection = client.db('MyCarDatabase').collection('carsData')
        const Category = client.db('MyCarDatabase').collection('CategoryData')
        const OrdersCollection = client.db('MyCarDatabase').collection('Orders')
        const ReportCollection = client.db('MyCarDatabase').collection('report')

        app.delete('/orders', async (req, res) => {
            const id = req.query.id
            const filter = {
                _id: ObjectId(id)
            }
            const result = await OrdersCollection.deleteOne(filter)
            res.send(result)
        })
        app.get('/jwt/token', async (req, res) => {
            const email = req.query.email
            const filter = {
                email,
            }
            const user = await UsersCollection.findOne(filter)
            if (user) {
                const token = JWT.sign({ email }, process.env.jwtTOKEN, { expiresIn: '10d' })
                res.send({ token })
            }
            res.status(401).send({ token: '' })
        })

        app.post('/report', async (req, res) => {
            const reportData = req.body;
            console.log(reportData);
            const result = await ReportCollection.insertOne(reportData)
            res.send(result)
        })

        app.delete('/report', async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const result = await ReportCollection.deleteOne(filter)
            console.log(id);
            res.send(result)
        })

        app.get('/report', async (req, res) => {
            const query = {}
            const result = await ReportCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/sellers', async (req, res) => {
            const seller = req.query.role;
            const query = {
                role: seller
            }
            const result = await UsersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/sellers', async (req, res) => {
            const id = req.query.id
            const role = req.query.role;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const docs = {
                $set: {
                    role
                }
            }
            const result = await UsersCollection.updateOne(filter, docs, option)
            res.send(result)
        })

        app.get('/myProduct', async (req, res) => {
            const email = req.query.email;
            const name = req.query.name;
            const query = {
                seller_info: {
                    name,
                    email,
                }
            }
            // console.log(query);
            const result = await CarsCollection.find(query).toArray()

            res.send(result)
        })
        app.post('/orders', async (req, res) => {
            const order = req.body
            // console.log(order);
            const result = await OrdersCollection.insertOne(order)
            res.send(result)
        })
        app.get('/orders', async (req, res) => {
            const email = req.query.email
            const query = {
                buyer_email: email,
            }
            const result = await OrdersCollection.find(query).toArray()
            res.send(result)
        })

        // app.put('/bookings', async (req, res) => {
        //     const id = req.query.id;
        //     const sold = req.body;
        //     console.log(sold);
        //     const filter = { _id: ObjectId(id) }
        //     const option = { upsert: true }
        //     const docs = {
        //         $set: { sold: true }
        //     }
        //     const result = await CarsCollection.updateOne(filter, docs, option)
        //     res.send({})
        // })

        app.get('/category', async (req, res) => {
            const query = {}
            const result = await Category.find(query).toArray()
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = {
                email: user.email
            }
            const alreadyAddedUser = await UsersCollection.findOne(filter)
            if (alreadyAddedUser) {
                const docs = {
                    $set: {
                        ...user
                    }
                }
                const data = await UsersCollection.updateOne(filter, docs)
                return res.send(data)
            }
            const result = await UsersCollection.insertOne(user)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const result = await UsersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/users', async (req, res) => {
            const role = req.query.role;
            const filter = {
                email: req.query.email
            }
            const option = { upsert: true }
            const docs = {
                $set: {
                    role,
                }
            }
            const result = await UsersCollection.updateOne(filter, docs, option)
            res.send(result)
        })

        app.delete('/users', async (req, res) => {
            const filter = {
                email: req.query.email
            }
            const result = await UsersCollection.deleteOne(filter)
            res.send(result)
        })

        app.post('/cars', async (req, res) => {
            const data = req.body;
            const date = new Date()
            const query = {
                ...data,
                date,
            }
            const result = await CarsCollection.insertOne(query)
            res.send(result)
        })

        app.get('/cars/data/:brand', async (req, res) => {
            const brand = req.params.brand
            const query = {
                brand: brand
            }
            const result = await CarsCollection.find(query).toArray()
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