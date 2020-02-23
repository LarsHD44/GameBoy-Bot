const Discord = require('discord.js')
const guild = require('discord.js')
const config = require("./config.json");

var client = new Discord.Client()


client.on('ready', () => {
    console.log(`Eingeloggt als ${client.user.tag}...`)
    client.user.setActivity(`DevSchuppen managen`);
})

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find(ch => ch.name === 'willkommen');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`${member} Ist jetzt Mitglied des **DevSchuppen**!`);
  });

client.on('message', message => {
    if (message.content === '+myavatar') {
        message.channel.send('Das ist dein Avatar:', message.author.avatarURL);
    }
});

const help = new Discord.RichEmbed()
	.setColor('#0099ff')
	.setTitle('Help')
	.setURL('http://devschuppen.bplaced.net/GB.html')
	.setAuthor('GameBoy', 'https://media.discordapp.net/attachments/643320294450266128/680894663657521169/GameBoy.png', 'http://devschuppen.bplaced.net/GB.html')
	.setDescription('Commands:')
	.setThumbnail('')
	.addField('Help', '+help')
	.addField('say', '+say', true)
	.addField('kick', '+kick', true)
  .addField('ban', '+ban', true)
  .addBlankField()
  .addField('Um alle Commands anzusehen klicke hier:', 'http://bit.ly/GB-Bot', true)
  .addBlankField()
  .addField('Support-Server:', 'https://discord.gg/C7sjRgC', true)
  .setImage('')
	.setTimestamp()
	.setFooter('GameBoy by Lars_HD44', 'https://media.discordapp.net/attachments/643320294450266128/680894663657521169/GameBoy.png');


client.on('message', message => {
    if (message.content === 'GB help') {
        channel.send(help);
    }
});  

  client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.
    
    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if(message.author.bot) return;
    
    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if(message.content.indexOf(config.prefix) !== 0) return;
    
    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // Let's go with a few common example commands! Feel free to delete or change those.
    
    if(command === "ping") {
      // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
      // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Die Latenz beträgt ${m.createdTimestamp - message.createdTimestamp}ms. Die API-Latenz beträgt ${Math.round(client.ping)}ms`);
    }
    
    if(command === "say") {
      // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
      // To get the "message" itself we join the `args` back into a string with spaces: 
      const sayMessage = args.join(" ");
      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o=>{}); 
      // And we get the bot to say the thing: 
      message.channel.send(sayMessage);
    }
    
    if(command === "kick") {
      // This command must be limited to mods and admins. In this example we just hardcode the role names.
      // Please read on Array.some() to understand this bit: 
      // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
      if(!message.member.roles.some(r=>["Owner", "Admin"].includes(r.name)) )
        return message.reply("Sorry, dazu hast du keine rechte!");
      
      // Let's first check if we have a member and if we can kick them!
      // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
      // We can also support getting the member by ID, which would be args[0]
      let member = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!member)
        return message.reply("Bitte erwähne Jemanden!");
      if(!member.kickable) 
        return message.reply("Ich kann diesen User nicht kicken! Hat dieser User eine höhere Rolle? Habe ich Kickrechte?");
      
      // slice(1) removes the first part, which here should be the user mention or ID
      // join(' ') takes all the various parts to make it a single string.
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "Kein Grund angegeben!";
      
      // Now, time for a swift kick in the nuts!
      await member.kick(reason)
        .catch(error => message.reply(`Sorry ${message.author} Ich konnte den User nicht kicken weil: ${error}`));
      message.reply(`${member.user.tag} wurde von ${message.author.tag} gekickt weil: ${reason}`);
  
    }
    
    if(command === "ban") {
      // Most of this command is identical to kick, except that here we'll only let admins do it.
      // In the real world mods could ban too, but this is just an example, right? ;)
      if(!message.member.roles.some(r=>["Owner"].includes(r.name)) )
        return message.reply("Sorry, dazu hast du keine rechte");
      
      let member = message.mentions.members.first();
      if(!member)
        return message.reply("Bitte erwähne jemanden!");
      if(!member.bannable) 
        return message.reply("Ich kann diesen User nicht bannen! Hat dieser User eine höhere Rolle? Habe ich Banrechte?");
  
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "Kein Grund Angegeben!";
      
      await member.ban(reason)
        .catch(error => message.reply(`Sorry ${message.author} Ich kann keinen bannen weil: ${error}`));
      message.reply(`${member.user.tag} wurde von ${message.author.tag} gebannt weil: ${reason}`);
    }
    
    if(command === "purge") {
      // This command removes all messages from all users in the channel, up to 100.
      
      // get the delete count, as an actual number.
      const deleteCount = parseInt(args[0], 10);
      
      // Ooooh nice, combined conditions. <3
      if(!deleteCount || deleteCount < 2 || deleteCount > 100)
        return message.reply("Bitte tippe eine Nummer von 2-100 ein!");
      
      // So we get our messages, and delete them. Simple enough, right?
      const fetched = await message.channel.fetchMessages({limit: deleteCount});
      message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`Konnte keine Nachichten löschen weil: ${error}`));
    }
  });
  

client.login(config.token);