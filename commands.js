const Discord = require('discord.js');
const config = require('./config.json');
const dedent = require('dedent-js');

module.exports = {
  help: async function(msg) {
    let mbd = new Discord.MessageEmbed()
      .setColor(config.bot.embedcolor)
      .setFooter(config.bot.footer.text, config.bot.footer.url)
      .addFields({
        name: 'Commands',
        value: await commands(msg)
      });
    msg.channel.send(mbd);
  },
  gameCheck: async function(client) {
    console.log('Checking the games: ' + config.game.games);
    // fetch all the users
    let list = await client.guilds.cache.get(config.game.server);
    // loop through their activities
    list.members.cache.forEach(member => {
      console.log('Checking: ' + member);
      // check for ones playing games in config.game.games
      let presence = member.presence.activities.filter(x=>x.type === "PLAYING");
      if(presence.length>0) {
        let time = (Date.now()-presence[0].createdTimestamp)/1000;
        console.log('Playing ' + presence[0].name + ' for ' + time + ' seconds');
        if(config.game.games.includes(presence[0].name.toLowerCase())) {
          if(time > config.game.time) {
            // give timeout if longer than config.game.time
            giveTimeout(client, member);
            return;
          }
        }
      }
    });
  }
}

async function commands(msg) {
  return(dedent(`
    ${config.bot.prefix}help - receive this message
    ${config.bot.prefix}ping - pong!
  `));
}

async function giveTimeout(client, member) {
  console.log('Giving timeout');
  let server = await client.guilds.cache.get(config.game.server);
  let user = await client.users.cache.find(user => user.id == member.id);
  await user.timeout(config.game.timeout*1000, config.game.reason);
  console.log('Set timeout for ' + member.id + " for " + config.game.timeout + ' seconds');
  return;
}
