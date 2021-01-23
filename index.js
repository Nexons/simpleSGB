const Discord = require('discord.js') //REQUIRING OUR FRAMEWORK PACKAGE (DISCORDJS)
const client = new Discord.Client()
const { PREFIX, TOKEN, TICKETCATEGORY, LOGCHANNEL, SUGGESTIONCHANNEL, AUTOWHITELISTADMINS, TICKETHANDLER_ROLE, VERIFICATIONCHANNEL, VERIFICATIONROLEID, GUILDID, autoDeleteInviteLinks, blacklistedWords } = require('./config.json')

client.on('ready', () => { //READY EVENT FIRED ONCE BOT ONLINE AND FIRES SOME CHECKS
    console.log(`${client.user.username} is online!`) //LOGGING WHEN BOT IS UP AND RUNNING
    const g = client.guilds.cache.get(GUILDID) //GETS THE GUILD FROM CONFIG.JSON
    console.log(g)
    if(!g) return console.log("⚠ BOT NOT USABLE! ⚠\nPLEASE INCLUDE YOUR GUILD ID IN THE CONFIG.JSON FILE UNDER GUILDID ⚠")
    const x = client.channels.cache.get(TICKETCATEGORY) //GETS TICKET CATEGORY ID FROM CONFIG.JSON
    if(!x) console.log("⚠ WARNING NO TICKET CATEGORY FOUND! TICKET COMMAND WILL NOT BE USABLE.") //IF INVALID WARN USER
    const y = client.channels.cache.get(SUGGESTIONCHANNEL) //GETS SUGGESTION CHANNEL ID FROM CONFIG.JSON
    if(!y) console.log("⚠ WARNING NO SUGGESTION CHANNEL FOUND! SUGGESTION COMMAND WILL NOT BE USABLE.") //IF INVALID WARN USER
    const z = client.channels.cache.get(LOGCHANNEL) //GETS LOG CHANNEL ID FROM CONFIG.JSON
    if(!z) console.log("⚠ WARNING NO LOG CHANNEL FOUND! MODERATION LOGS WILL NOT BE USABLE.") //IF INVALID WARN USER
    const p = client.channels.cache.get(VERIFICATIONCHANNEL) //GETS VERIFICATION CHANNEL ID FROM CONFIG.JSON
    if(!p) console.log("⚠ WARNING NO VERIFICATION CHANNEL FOUND! CAPTCHA VERIFICATION WILL NOT BE USABLE.") //IF INVALID WARN USER
    const vr = g.roles.cache.get(VERIFICATIONROLEID) //GETS THE VERIFICATION ROLE ID FROM CONFIG.JSON THEN GETS IT FROM THE GUILD
    if(!vr) console.log("⚠ WARNING NO VERIFICATION ROLE FOUND! CAPTCHA VERIFICATION WILL NOT BE USABLE.") //IF INVALID WARN USER 
    if(AUTOWHITELISTADMINS == true) console.log("⚠ ALL USERS WITH ADMINISTRATOR PERMISSION WILL BE ABLE TO USE WHITELISTED-ONLY COMMANDS\nChange this to false if you would not like admins to use whitelisted user commands!")
})


const fs = require('fs') //REQUIRE FILESYSTEM FOR READING AND WRITING FILES
const badWord = require('./events/badWord')
client.commands = new Discord.Collection() //CREATE NEW COLLECTION
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); //GET ALL COMMAND FILES AND RETURN INTO AN ARRAY
for (const file of commandFiles) { //LOOPS EACH FILE AND ADDS IT TO THE COMMANDS COLLECTION
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command); //ADD ALL COMMANDS TO COMMAND COLLECTION
}
client.events = new Discord.Collection() //CREATE NEW COLLECTION
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); //GET ALL EVENT FILES AND RETURN INTO AN ARRAY
for (const file of eventFiles) { //LOOPS EACH FILE AND ADDS IT TO THE EVENTS COLLECTION
	const event = require(`./events/${file}`);
	client.events.set(event.name, event); //ADD ALL EVENTS TO EVENT COLLECTION
}
let whitelistedIDS = [];
const data = fs.readFileSync('whitelist.txt', 'UTF-8'); //READ THE WHITELIST.TXT IN UTF-8 FORMAT
const lines = data.split(/\r?\n/); //SPLIT THE DATA BY LINES
lines.forEach((line) => { //READS LINES OF WHITELIST
    whitelistedIDS.push(line) //PUSH THE ID TO THE ARRAY
}); //GET WHITELISTED ID'S AND PUT INTO WHITELISTEDIDS ARRAY
client.on('message', async msg => { //MESSAGE EVENT FIRED ONCE A USER SENDS A MESSAGE
    if(msg.author.bot) return //IGNORE THE MESSAGE IF IT IS A BOT USER
    const args = msg.content.slice(PREFIX.length).split(' ')
    const words = msg.content.split(' ')
    const COMMAND = args[0] //GETS THE NAME OF THE COMMAND THE USER HAS CALLED BY CUTTING OFF THE PREFIX AND GETTING THE FIRST ARGUMENT
    if(blacklistedWords.includes(words)) return client.events.get(badWord).execute(msg, blacklistedWords, words, LOGCHANNEL), console.log('ree')
    if(!msg.content.startsWith(PREFIX)) return //IGNORE THE MESSAGE IF IT DOES NOT START WITH THE PREFIX
    if (!client.commands.has(COMMAND)) return; //IF THE CLIENT DOES NOT INCLUDE THE COMMAND THE USER HAS ATTEMPTED TO EXECUTE THEN RETURN (IGNORE)

    try {
        client.commands.get(COMMAND).execute(msg, args, client, PREFIX, TOKEN, TICKETCATEGORY, LOGCHANNEL, SUGGESTIONCHANNEL, AUTOWHITELISTADMINS, TICKETHANDLER_ROLE, VERIFICATIONCHANNEL, VERIFICATIONROLEID, GUILDID, autoDeleteInviteLinks); //GET COMMAND FROM COMMAND COLLECTION
    } catch (error) {
        console.log(error); //LOG THE ERROR
        msg.reply('There was an error trying to execute that command!'); //IF ERROR WARN USER
    }
})

client.login(TOKEN).catch(error => { //LOG INTO THE DISCORD BOT WITH THE SPECIFIED TOKEN (CONFIG.JSON) AND CATCH ANY ERROR
    if(error) return console.log('Something went wrong logging in with that token\nPossible Issues:\nNo token stored in config.json\nToken stored in config.json is a user token') //IF ERROR USER HAS EITHER PROVIDED NO TOKEN OR A USER TOKEN
})