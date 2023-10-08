const dotenv = require('dotenv')
const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf')


const bot = new Telegraf(process.env.TOKEN)



async function getServerData() {
    try {
        const response = await fetch("https://api.mcstatus.io/v2/status/java/" + process.env.SERVER_URL);
        
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

app.post(`/bot${process.env.TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
  console.log(`Express server is listening on ${process.env.PORT}`);
});

bot.command('players', async ( msg ) => {
    try {
        console.log('f')
        let serverData = await getServerData();
        let playersList = serverData.players.list;

        var botResponse = '';

        if (playersList.length > 0) {
            let playersName = playersList.map(player => player.name_clean)
        
            let players = playersName.join('\n')
            botResponse = '<u>Гравці онлайн:</u>\n\n' + players
        } else {
            botResponse = '<u>Гравці відсутні</u>'
        }
        

        msg.reply(botResponse, {parse_mode: "HTML"});
    } catch (error) {
        console.error(error);
    }
});

bot.launch()