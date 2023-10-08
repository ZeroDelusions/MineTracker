const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '6458616705:AAF03IpVznnXXUw9XEfYR18BTL6hd4k9PPg'
const bot = new TelegramBot(TOKEN, { polling: true });
const port = 3000;

const SERVER_URL = "130.162.217.88"

async function getServerData() {
    try {
        const response = await fetch("https://api.mcstatus.io/v2/status/java/" + SERVER_URL);
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Server response wasn\'t OK');
        }
    } catch (error) {
        throw error;
    }
};

const app = express();

app.use(express.json());

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.onText(/\/players/, async (msg) => {
    try {
        let serverData = await getServerData();
        let playersList = serverData.players.list
        console.log(playersList)
        let playersName = playersList.map(player => player.name_clean)

        let players = playersName.join('\n')
        let botResponse = '<u>Гравці онлайн:</u>\n\n' + players

        bot.sendMessage(msg.chat.id, botResponse, {parse_mode: 'HTML'});
    } catch (error) {
        console.error(error);
    }
});

bot.on("polling_error", console.log);