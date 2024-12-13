const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.y6uow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    tls: true,
    serverSelectionTimeoutMS: 3000,
    autoSelectFamily: false,
});

async function run() {
    // jobs collection
    const JobCollection = client.db('JobDataDb').collection("jobs");
    const ApplyCollection = client.db('JobDataDb').collection('appliedJobs')
    try {

        // get all jobs
        app.get('/allJobs', async (req, res) => {
            const cursor = JobCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // display 6 jobs
        app.get('/sixJobs', async (req, res) => {
            const cursor = JobCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result)
        })

        // get a single job
        app.get('/jobDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await JobCollection.findOne(query);
            res.send(result);
        })

        // query by email for getting applied jobs

        app.get('/myAppliedJobs', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const result = await ApplyCollection.find(query).toArray();
            for (const application of result) {
                const query = { _id: new ObjectId(application.jobID) };
                const jobs = await JobCollection.findOne(query);
                if (jobs) {
                    application.title = jobs.title;
                    application.company = jobs.company;
                    application.company_logo = jobs.company_logo;
                    application.jobType = jobs.jobType;
                }
            }
            res.send(result);
        })

        // Apply for a job

        app.post('/applyJob', async (req, res) => {
            const ApplyJob = req.body;
            const result = await ApplyCollection.insertOne(ApplyJob);
            res.send(result);
        })

    } finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running')
})



app.listen(port, () => {
    console.log('server is running on port', port);
})