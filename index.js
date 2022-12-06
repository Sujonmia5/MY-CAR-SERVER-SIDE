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
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'Users Unauthorized' })
    }
    JWT.verify(authorization, process.env.jwtTOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Users Unauthorized' })
        }
        req.decoded = decoded
    })
    next()
}

async function run() {
    try {
        const UsersCollection = client.db('MyCarDatabase').collection('users')
        const CarsCollection = client.db('MyCarDatabase').collection('carsData')
        const Category = client.db('MyCarDatabase').collection('CategoryData')
        const OrdersCollection = client.db('MyCarDatabase').collection('Orders')
        const ReportCollection = client.db('MyCarDatabase').collection('report')

        const verifyAdmin = async (req, res, next) => {
            const decoded = req.decoded.email;
            const query = {
                email: decoded
            }
            const userAdmin = await UsersCollection.findOne(query)
            if (userAdmin?.role !== 'Admin') {
                return res.status(403).send({ message: 'You cannot make a admin' })
            }
            next()
        }

        app.get('/advertise', async (req, res) => {
            const query = {
                sold: false,
                advertise: true,
            }

            const result = await CarsCollection.find(query).toArray()
            res.send(result)
        })


        app.put('/advertise', verifyToken, async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const docs = {
                $set: {
                    advertise: true
                }
            }
            const result = await CarsCollection.updateOne(filter, docs, option)
            console.log(result);
            res.send(result)
        })

        app.put('/verify/seller', verifyToken, async (req, res) => {
            const seller = req.query.email;
            const filter = {
                email: seller,
            }
            const option = { upsert: true };
            const docs = {
                $set: {
                    verify: true
                }
            }
            const result = await UsersCollection.updateOne(filter, docs, option)
            res.send(result)
        })
        app.put('/verify/delete', verifyToken, async (req, res) => {
            const seller = req.query.email;
            const filter = {
                email: seller,
            }
            const option = { upsert: true };
            const docs = {
                $set: {
                    verify: false
                }
            }
            const result = await UsersCollection.updateOne(filter, docs, option)
            res.send(result)
        })

        app.get('/verify/check', verifyToken, async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = {
                email,
            }
            const result = await UsersCollection.findOne(query)
            console.log(result);
            if (result) {
                return res.send({ isVerify: result.verify })
            }
        })


        app.get('/adminUser', verifyToken, async (req, res) => {
            const email = req.query.email;
            const filter = {
                email
            }
            const result = await UsersCollection.findOne(filter)
            if (result) {
                return res.send({ isAdmin: result?.role === 'admin' })
            }
        })
        app.get('/sellerUser', verifyToken, async (req, res) => {
            const email = req.query.email;
            const filter = {
                email
            }
            const result = await UsersCollection.findOne(filter)
            if (result) {
                return res.send({ isSeller: result?.role === 'seller' })
            }
        })

        app.delete('/orders', verifyToken, async (req, res) => {
            const id = req.query.id
            const filter = {
                _id: ObjectId(id)
            }
            const result = await OrdersCollection.deleteOne(filter)
            res.send(result)
        })
        app.get('/jwt/token', async (req, res) => {
            const email = req.query.email
            // console.log(email);
            const filter = {
                email,
            }
            const user = await UsersCollection.findOne(filter)
            if (user) {
                const token = JWT.sign({ email }, process.env.jwtTOKEN, { expiresIn: '10d' })
                return res.send({ token })
            }
            res.status(401).send({ token: '' })
        })

        app.post('/report', verifyToken, async (req, res) => {
            const reportData = req.body;
            // console.log(reportData);
            const result = await ReportCollection.insertOne(reportData)
            res.send(result)
        })

        app.delete('/report', verifyToken, async (req, res) => {
            const id = req.query.id;
            const filter = { _id: ObjectId(id) }
            const result = await ReportCollection.deleteOne(filter)
            // console.log(id);
            res.send(result)
        })

        app.get('/report', verifyToken, async (req, res) => {
            const query = {}
            const result = await ReportCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/sellers', verifyToken, async (req, res) => {
            const seller = req.query.role;
            const query = {
                role: seller
            }
            const result = await UsersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/sellers', verifyToken, async (req, res) => {
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

        app.get('/myProduct', verifyToken, async (req, res) => {
            const email = req.query.email;
            const name = req.query.name;
            const query = {
                seller_info: {
                    name,
                    email,
                }
            }
            const result = await CarsCollection.find(query).toArray()

            res.send(result)
        })
        app.post('/orders', verifyToken, async (req, res) => {
            const order = req.body
            // console.log(order);
            const result = await OrdersCollection.insertOne(order)
            res.send(result)
        })
        app.get('/orders', verifyToken, async (req, res) => {
            const email = req.query.email
            const query = {
                buyer_email: email,
            }
            const result = await OrdersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/CategoryData', async (req, res) => {
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
        app.get('/users', verifyToken, async (req, res) => {
            const query = {}
            const result = await UsersCollection.find(query).toArray()
            res.send(result)
        })
        app.put('/users', verifyToken, async (req, res) => {
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

        app.delete('/users', verifyToken, async (req, res) => {
            const filter = {
                email: req.query.email
            }
            const result = await UsersCollection.deleteOne(filter)
            res.send(result)
        })

        app.post('/cars', verifyToken, async (req, res) => {
            const data = req.body;
            const date = new Date()
            const query = {
                ...data,
                date,
            }
            const result = await CarsCollection.insertOne(query)
            res.send(result)
        })

        app.get('/cars/data/:brand', verifyToken, async (req, res) => {
            const brand = req.params.brand
            const query = {
                brand: brand,
                sold: false,
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