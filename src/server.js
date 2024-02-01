import express from 'express';
import { MongoClient } from 'mongodb';
import { db, connectToDB } from './db.js';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '..build/index.html'));
})

//articles
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;

    const article = await db.collection('articles').findOne({ name });

    if (article) {
    res.json(article);
    } else {
        res.sendStatus(404).send('Article not found');
    }

});

//projects
app.get('/api/projects/:name', async (req, res) => {
    const { name } = req.params;

    await db.collection('projects').updateOne({ name }, {
        $inc: { upvotes: 1 },
    });

    const project = await db.collection('projects').findOne({ name });

    if (project) {
    res.json(project);
    } else {
        res.send('Project not found');
    }

});


app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
   
    await db.collection('articles').updateOne({ name }, {
        $inc: { upvotes: 1 },
    });
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist');
    }
});


app.put('/api/projects/:name/upvote', async (req, res) => {
    const { name } = req.params;
   
    await db.collection('projects').updateOne({ name }, {
        $inc: { upvotes: 1 },
    });
    const project = await db.collection('projects').findOne({ name });

    if (project) {
        res.json(project);
    } else {
        res.send('That project doesn\'t exist');
    }
});




// app.delete("/api/articles/:name/comments", function(req, res) {
//     console.log("req params", req.params.id)
//     myArray = myArray.filter(({ id }) => id !== req.params.id);
//   });





app.post('/api/projects/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { postedBy, text } = req.body;

    await db.collection('projects').updateOne({ name }, {
        $push: { comments: { postedBy, text } },
    });
    const project = await db.collection('projects').findOne({ name });

    if (project) {
        res.json(project);
    } else {
        res.send('That project doesn\'t exist!');
    }
});

app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { postedBy, text } = req.body;

    await db.collection('articles').updateOne({ name }, {
        $push: { comments: { postedBy, text } },
    });
    const article = await db.collection('articles').findOne({ name });

    if (article) {
        res.json(article);
    } else {
        res.send('That article doesn\'t exist!');
    }
});
    

const PORT = process.env.PORT || 8000;

connectToDB(() => {
    console.log('Succesfully connected to database!')
    app.listen(PORT, () => {
        console.log('Server is listening on port ' + PORT);
    });
});