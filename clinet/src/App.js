import React, { useEffect, useState } from 'react'
import './App.css';
import { connect, createLocalVideoTrack } from 'twilio-video'
import axios from 'axios'

function App() {
  const [roomName, setRoomName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')

  const handleRoomConnect = async () => {

    try {

      console.log('creating the access token')

      const jwtToken = await axios.post('http://localhost:3001/accessToken', { userName, roomName })
      const TOKEN = jwtToken.data.jwt

      if(TOKEN) {
        console.log('access token created')
      }

      connect(`${TOKEN}`, { name: `${roomName}` }).then((room) => {

        console.log(`Successfully joined a Room ${room}`)

        room.participants.forEach(participant => {
          console.log(`Participants ${participant.identity} is in the room`)

          participant.on('trackSubscribed', track => {
            document.getElementById('remote-media').appendChild(track.attach());
          });

          participant.tracks.forEach(track => {
            document.getElementById('remote-media').appendChild(track.attach());
          })

        })
    
        room.once('participantConnected', participant => {
          console.log(`Participant ${participant.identity} has joined`)
        })
    
        room.once('participantDisconnected', participant => {
          console.log(`Participant ${participant.identity} has left`)
        })
  
        room.on('participantConnected', participant => {
          console.log(`Participant "${participant.identity}" connected`);

          participant.tracks.forEach(track => {
            document.getElementById('remote-media').appendChild(track.attach());
          })
        
          participant.on('trackSubscribed', track => {
            document.getElementById('remote-media').appendChild(track.attach());
          });
        });

      }, error => {
        console.log(`Unable to Connect to the room: ${error.message}`)
      })

    } catch (e) {
      console.log(`Unable to Connect to the room: ${e.message}`)
    }

  }

  useEffect(() => {

    // createLocalVideoTrack().then((track) => {
    //   const localMediaContainer = document.getElementById('local-media')
    //   localMediaContainer.appendChild(track.attach())
    // })

  }, [])

  const handleCreateRoom = async () => {
    try {
      console.log('creating the room')
      const room = await axios.post('http://localhost:3001/createRoom')
      const roomId = room.data.roomName
      setRoomId(roomId)
      console.log(roomId)

    } catch (e) {
      console.log('error occured')
    }
  }
 
  return (
    <div>

      <h4>For Development of name.com</h4>

      <button onClick={handleCreateRoom}>Create the room</button>

      <br></br><br></br>

      { roomId && roomId }

      <br></br><br></br>

      <input type="text" placeholder="room name" value={roomName} onChange={e => setRoomName(e.target.value)} />

      <br></br><br></br>

      <input type="text" placeholder="user name" value={userName} onChange={e => setUserName(e.target.value)} />

      <br></br><br></br>

      <button onClick={handleRoomConnect}>Join to the room</button>

      <div id="local-media">

      </div>

      <div id="remote-media">

      </div>

    </div>
  );
}

export default App;
