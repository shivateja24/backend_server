const express = require('express');
const cors = require('cors');
const mysql = require('mysql');


const app = express();
const port = 3090;

const con = mysql.createConnection({
  host: 'localhost',
  port: '3050',
  user: 'root',
  password: 'Shiva242004',
  database: 'link_too',
});

con.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database successfully!');
});


app.use(cors());
app.use(express.json());

// Route to create a user
// Route to create a user
app.post('/create_user', (req, res) => {
  console.log("in the create user")
  console.log("req.body",req.body)
  const { rollno, username, password } = req.body; // Assuming the request body contains user_id, username, and password
  // Insert the user into the database
  const query = 'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)';
  con.query(query, [rollno, username, password], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Error creating user' });
    }
    res.status(201).json({ message: 'User created successfully' });
  });
});



app.post('/login', (req, res) => {
  console.log("in the login")
  console.log("req.body",req.body)
  const { rollno, password } = req.body; // Assuming the request body contains user_id and password
  // Check if the user exists in the database
  const query = 'SELECT * FROM users WHERE user_id = ? AND password = ?';
  con.query(query, [rollno, password], (err, result) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Error during login' });
    }
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid user_id or password' });
    }
    res.json({ message: 'Login successful' });
  });
});
app.get('/messages', (req, res) => {
  console.log("in the messages");
  const query = 'SELECT * FROM messages';
  con.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Error fetching messages' });
    }
    console.log('Messages fetched successfully:', result);
    res.json(result);
  });
});


const http = require('http');

app.post('/post_message', (req, res) => {
  console.log("in the post message");
  const { message } = req.body;

  // Insert the message into the database
  const query = 'INSERT INTO messages (message) VALUES (?)';
  con.query(query, [message], (err, result) => {
    if (err) {
      console.error('Error posting message:', err);
      return res.status(500).json({ error: 'Error posting message' });
    }

    // Construct the data to be sent in the POST request
    const postData = JSON.stringify({
      query: message // Modify this with the actual query you want to send
    });

    // Define the options for the HTTP POST request
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    // Create the HTTP request object
    const httpRequest = http.request(options, (httpResponse) => {
      let data = '';
      httpResponse.on('data', (chunk) => {
        data += chunk;
      });
      httpResponse.on('end', () => {
        console.log('Query sent successfully:', data);
        res.status(201).json({ message: 'Message posted successfully' });
      });
    });

    // Handle errors
    httpRequest.on('error', (error) => {
      console.error('Error sending query:', error);
      res.status(500).json({ error: 'Error sending query' });
    });

    // Write the data to the request body
    httpRequest.write(postData);
    httpRequest.end();
  });
});



app.get('/events', (req, res) => {
  const selectedDate = req.query.date; // Extract date from the URL query parameters
  console.log("selected date:" ,selectedDate);
  // Example SQL query to fetch events for the specified date
  const query = "SELECT events.event_type, events.event_time, subjects.subject_name FROM events LEFT JOIN subjects ON events.subject_id = subjects.subject_id WHERE DATE(events.event_date) = ?"
    con.query(query, [selectedDate], (err, result) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ error: 'Error fetching events' });
    }
    res.json(result);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

