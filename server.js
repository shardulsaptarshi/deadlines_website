const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
let db;
let deadlinesCollection;
let plannerCollection;

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);

        db = client.db('deadlines-app');
        deadlinesCollection = db.collection('deadlines');
        plannerCollection = db.collection('planner');

        // Create indexes for better query performance
        await deadlinesCollection.createIndex({ dueDate: 1 });
        await deadlinesCollection.createIndex({ createdAt: -1 });

        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// API Routes

// Get all deadlines (sorted by due date)
app.get('/api/deadlines', async (req, res) => {
    try {
        const deadlines = await deadlinesCollection
            .find({})
            .sort({ dueDate: 1 })
            .toArray();
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deadlines' });
    }
});

// Get a single deadline
app.get('/api/deadlines/:id', async (req, res) => {
    try {
        const deadline = await deadlinesCollection.findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!deadline) {
            return res.status(404).json({ error: 'Deadline not found' });
        }

        res.json(deadline);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deadline' });
    }
});

// Create a new deadline
app.post('/api/deadlines', async (req, res) => {
    try {
        const { title, description, dueDate, dueTime } = req.body;

        if (!title || !dueDate) {
            return res.status(400).json({ error: 'Title and due date are required' });
        }

        const deadline = {
            title,
            description: description || '',
            dueDate: new Date(dueDate),
            dueTime: dueTime || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await deadlinesCollection.insertOne(deadline);
        const newDeadline = await deadlinesCollection.findOne({
            _id: result.insertedId
        });

        res.status(201).json(newDeadline);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create deadline' });
    }
});

// Update a deadline
app.put('/api/deadlines/:id', async (req, res) => {
    try {
        const { title, description, dueDate, dueTime } = req.body;

        if (!title || !dueDate) {
            return res.status(400).json({ error: 'Title and due date are required' });
        }

        const updateData = {
            title,
            description: description || '',
            dueDate: new Date(dueDate),
            dueTime: dueTime || null,
            updatedAt: new Date()
        };

        const result = await deadlinesCollection.findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Deadline not found' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update deadline' });
    }
});

// Delete a deadline
app.delete('/api/deadlines/:id', async (req, res) => {
    try {
        const result = await deadlinesCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Deadline not found' });
        }

        res.json({ message: 'Deadline deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete deadline' });
    }
});

// Get tomorrow's plan
app.get('/api/planner/tomorrow', async (req, res) => {
    try {
        const plan = await plannerCollection.findOne({ type: 'tomorrow' });
        res.json(plan || { content: '', selectedDeadlines: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
});

// Save tomorrow's plan
app.post('/api/planner/tomorrow', async (req, res) => {
    try {
        const { content, selectedDeadlines } = req.body;

        const result = await plannerCollection.findOneAndUpdate(
            { type: 'tomorrow' },
            {
                $set: {
                    content: content || '',
                    selectedDeadlines: selectedDeadlines || [],
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save plan' });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();
