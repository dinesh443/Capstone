const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./index.json');

const app = express();
const port = 3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://capstone-82fc4-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    try {
        // Create a new user with email and password
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: username
        });

        // Store additional user data in Firestore
        const userDocRef = db.collection('users').doc(userRecord.uid);
        await userDocRef.set({
            username: username,
            email: email
        });

        res.send('Signup successful');
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('An error occurred');
    }
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signin', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const userRecord = await admin.auth().getUserByUsername(username);
        // Authenticate user using Firebase Authentication
        await admin.auth().signInWithEmailAndPassword(userRecord.email, password);
        
        res.send('Signin successful');
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).send('An error occurred');
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
