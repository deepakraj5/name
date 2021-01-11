const express = require('express')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

const AccessToken = require('twilio').jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

const apiKey = process.env.API_KEY
const apiSecret = process.env.API_SECRET

app.post('/createRoom', async (req, res) => {
    try {
        const room = await client.video.rooms.create({
            type: 'group-small',
            uniqueName: uuidv4()
        })

        res.send({ roomName: room.uniqueName })
    } catch (e) {
        res.status(500).send({ error: e })
    }
})

app.post('/accessToken', async (req, res) => {
    try {
        const identity = req.body.userName
        const roomName = req.body.roomName

        let videoGrant = new VideoGrant()

        const token = new AccessToken(accountSid, apiKey, apiSecret)

        token.identity = identity

        videoGrant.room = roomName

        token.addGrant(videoGrant)

        const jwt = token.toJwt()

        res.send({ jwt })

    } catch (e) {
        res.status(500).send({ error: e })
    }
})

app.listen(PORT, () => {
    console.log(`server upon port ${PORT}`)
})