import './App.css';
import React, { useState, useEffect } from 'react';

function App(props) {

  const timeSlots = {
    Monday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Tuesday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Wednesday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Thursday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Friday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Saturday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    Sunday: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  };

  const [selectedDay, setSelectedDay] = useState('');

  const [email, setEmail] = useState('');
  const [bookingStatus, setBookingStatus] = useState(Array(7).fill(false));
  const [bookings, setBookings] = useState([]);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/bookings?fields=email,time,day`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch booking');
        }
      })
      .then(data => {
        console.log(data);
        if (data && data.length > 0) {
          const bookedSlots = data.filter(booking => booking.day === selectedDay).map(booking => booking.time);
          const updatedStatus = timeSlots[selectedDay].map(timeSlot => bookedSlots.includes(timeSlot));
          setBookingStatus(updatedStatus);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, [selectedDay, timeSlots]);

  const handleBooking = (selectedDay, timeSlotValue, index) => {
    const emailInput = document.getElementById('email');

    if (bookedSlots.includes(emailInput.value)) {
      alert("Sama sähköposti ei voi varata kahta aikaa!");
      return;
    }

    const booking = { email: emailInput.value, day: selectedDay, time: timeSlotValue };

    fetch('http://localhost:8000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    })
      .then(response => {
        if (response.ok) {
          setIsBooked(true);
          console.log(`Booking confirmed for ${selectedDay} ${timeSlotValue} with email ${emailInput.value}`);
          setBookingStatus(prevStatus => {
            const newStatus = [...prevStatus];
            newStatus[index] = true;
            return newStatus;
          });
          setBookedSlots(prevSlots => [...prevSlots, emailInput.value]);
        } else {
          throw new Error('Failed to save booking');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleDeleteBookings = () => {
    const emailToDelete = document.getElementById('email').value;
  
    fetch(`http://localhost:8000/bookings?email=${emailToDelete}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          // Handle successful deletion
        } else {
          throw new Error('Failed to delete bookings');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="App">
      <p className='header'>Varaus</p>

      <section className='sectionone'>
        <input
          id='email'
          className='email'
          placeholder='Sähköposti'
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className='button' style={{ background: 'red' }} onClick={handleDeleteBookings}>Poista varaus</button>

        <div className="time">
          {Object.keys(timeSlots).map(day => (
            <label key={day}>
              <input type="radio" name="week-day" className="week-button" value={day} onClick={() => setSelectedDay(day)} /> {day}
            </label>
          ))}
        </div>

      </section>
      <section className='sectiontwo'>
        {selectedDay && (
          <div className='boxsize'>
            <h2>{selectedDay}</h2>
            {timeSlots[selectedDay].map((timeSlot, index) => (
              <div className='box' key={index}>
                <p className='booktime'><i className='bx bx-time-five'></i> {timeSlot}</p>
                {bookingStatus[index] ? (
                  <button className='button' style={{ background: 'red' }}>Varattu</button>
                ) : (
                  <button className='button' style={{ background: 'limegreen' }} onClick={() => {
                    const Input = document.getElementById('email');
                    if (Input.value.length >= 4 && Input.value.includes('@')) {
                      handleBooking(selectedDay, timeSlot, index);
                    } else {
                      alert("Et ole täyttänyt email kenttää oikein!")
                    }
                  }}>Varaa</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;