const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const bookings = [];

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE']
}));
app.use(express.json());

const dbURI = `OWN CLUSTER:)`;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

const bookingSchema = new mongoose.Schema({
  email: String,
  day: String,
  time: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// Listen for incoming requests on port 8000
const port = 8000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

app.get('/message', (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get('/bookings', (req, res) => {
  Booking.find()
    .then((bookings) => {
      res.json(bookings);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching bookings from database');
    });
});

app.post('/bookings', (req, res) => {
  const { email, day, time } = req.body;

  const newBooking = new Booking({
    email,
    day,
    time,
  });

  newBooking.save()
    .then(() => {
      res.status(201).send('Booking saved to database');
      send(email)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error saving booking to database');
    });
});

app.delete('/bookings', (req, res) => {
  const { email } = req.query;

  Booking.deleteMany({ email: email })
    .then(() => {
      res.status(200).send('Bookings deleted successfully');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error deleting bookings');
    });
});

function send(email) {
  const formData = require('form-data');
  const Mailgun = require('mailgun.js');
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: 'ebb1886b17f20056e2b097b29ad7c3a8-102c75d8-fa598c7b',
  });
  mg.messages
    .create('sandboxe734a8b8066a4850924b93eb4da48eb3.mailgun.org', {
      from: "Mailgun Sandbox <postmaster@sandboxe734a8b8066a4850924b93eb4da48eb3.mailgun.org>",
      to: [email],
      subject: "Varaus vahvistettu!",
      text: "Varauksesi on nyt kirjattu, Kiitos!",
    })
    .then(msg => console.log(msg)) // logs response data
    .catch(err => console.log(err)); // logs any error`;
}