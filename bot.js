require('dotenv').config()
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
        let serverData = await getServerData();
        let playersList = serverData.players.list;

        var botResponse = '';

        if (playersList.length > 0) {
            let playersName = playersList.map(player => {
                if(typeof process.env.PLAYERS_ICONS !== 'undefined' && process.env.PLAYERS_ICONS.length > 0) {
                    playersIcons = JSON.parse(process.env.PLAYERS_ICONS)
                    for(const key in playersIcons) {
                        if(player.name_clean == key) {
                            return `${playersIcons[key]} ` + player.name_clean
                        }
                    }
                }
                return player.name_clean
            }).join('\n');
        
            botResponse = '<u>Гравці онлайн:</u>\n\n' + playersName
        } else {
            botResponse = '<u>Гравці відсутні</u>'
        }

        msg.reply(botResponse, {parse_mode: "HTML"});
    } catch (error) {
        console.error(error);
    }
});

bot.launch()
