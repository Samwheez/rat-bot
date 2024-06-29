//TODO Fix goop. also add trading and !flex.  Make goop show a mini inv? or just add shortinv maybe


const Discord = require("discord.js");
const fs = require("fs")
const config = require("./config.json");
const rattokens = require("./rattokens.json");
const cooldowns = require("./cooldowns.json");
const characters = require("./characters.json");
const ms = require("parse-ms");
const inventories = require("./inventories.json");



const client = new Discord.Client();


const prefix = "!";

const timeout = 57600000;
const reward = 3;


const cost = 1;

const rarities = ["Mouse","Rat","Dire Rat","Enlightened Rat","Ratlantean"];
const rarityGoopGiven = [1,3,5,8,20];
const rarityPercentChance = [58.5, 25, 10, 5, 1.5]
const rarityColors = ["GREY","GREEN","BLUE","PURPLE","GOLD"];

const patchnotes = "Patch notes: \nNo longer a statistical improbability to get the last indexed rat in a rarity. Basically fixed accidental weighting.\nFixed Ratlanteans unintentionally being .5% drop rate instead of 1.5%.  Woops\nCan now write !patchnotes in rat_den to see the most recent patchnotes\nGooping was fixed, and there is a newly implemented !shortinv command"


function dropper(rarity, message)
{
	var max = characters[rarity].length 
	var dropped = Math.floor(Math.random() * (max));
	
	var embed = new Discord.MessageEmbed();
	
	for (var x=0;x<rarities.length;x++){
		if (rarity === rarities[x])
		{
			embed.setColor(rarityColors[x]);
		}
					
	}
	embed.setTitle(`You got a ${characters[rarity][dropped].name}`);
	embed.addField("Rarity",rarity);
	embed.setThumbnail(characters[rarity][dropped].image);
	if (rarity=="Ratlantean")
	{
		message.channel.send(" ", {files: ["./Congratulations!!!!.mp4"]});
	}
	message.channel.send(embed);
	return {
		name: characters[rarity][dropped].name,
		rarity: rarity,
		baseattack: characters[rarity][dropped].attack,
		basedefense: characters[rarity][dropped].defense,
		basehealth: characters[rarity][dropped].health,
		attack: characters[rarity][dropped].attack,
		defense: characters[rarity][dropped].defense,
		health: characters[rarity][dropped].health,
		attackgrowth: characters[rarity][dropped].attackgrowth,
		defensegrowth: characters[rarity][dropped].defensegrowth,
		healthgrowth: characters[rarity][dropped].healthgrowth,
		level: 1,
		image: characters[rarity][dropped].image
	}
	
}

function characterUpdater(characterInInv)
{
	characterIndex = 0
	for (var i=0;i<characters[characterInInv.rarity].length;i++)
	{
		if (characterInInv.name==characters[characterInInv.rarity][i].name)
			characterIndex=i
	}
	
	
	return {
		name: characterInInv.name,
		rarity: characterInInv.rarity,
		baseattack: characters[characterInInv.rarity][characterIndex].attack,
		basedefense: characters[characterInInv.rarity][characterIndex].defense,
		basehealth: characters[characterInInv.rarity][characterIndex].health,
		attack: characterInInv.attack,
		defense: characterInInv.defense,
		health: characterInInv.health,
		attackgrowth: characters[characterInInv.rarity][characterIndex].attackgrowth,
		defensegrowth: characters[characterInInv.rarity][characterIndex].defensegrowth,
		healthgrowth: characters[characterInInv.rarity][characterIndex].healthgrowth,
		level: characterInInv.level,
		image: characters[characterInInv.rarity][characterIndex].image
	}
}

client.on("ready", function(message){ 
	var general = client.channels.resolve('670360908064882700')
	//general.send("Starting")
	var rat_den = client.channels.resolve('670138307471999007')
	rat_den.send(patchnotes)
});
client.on("message", function(message){ 
	
	if (message.author.bot) return;
	//if (!message.content.startsWith(prefix)) return;
	var commandBody = message.content.slice(prefix.length);
	var args = commandBody.split(' ');
	var command = args.shift().toLowerCase();
	
	var user = message.author;
	
	if (message.content.includes("bidoof")||message.content.includes("Bidoof"))
		message.channel.send("Bidoof spotted")
	if ((command === "patchnotes")&& (message.channel.id === "670138307471999007"))
	{
		message.channel.send(patchnotes);
	}
	
	if ((command === "gamba" || command === "bigpulls")&& (message.channel.id === "670138307471999007"))
	{
		
		if(!rattokens[user.id]) {
			message.channel.send(`You don't have enough Rat Tokens. Next gimme available in 0h 0m 0s`);
			
		} else {
			if(!inventories[user.id]) {
				inventories[user.id] = {
					name: user.tag,
					inventory: [],
					goop: 0
				}
				fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
					if(err) console.log(err);
				});	
			}
			
			
			if (rattokens[user.id].rattokens>=cost)
			{
					rattokens[user.id].rattokens-=cost;
					var drop = Math.random()*101;
					var raritySum = 0;
					for (i=0;i<rarityPercentChance.length;i++){
						
						raritySum+=rarityPercentChance[i]
						
						if (drop < raritySum){
							
							inventories[user.id].inventory.push(dropper(rarities[i], message));
							i=rarityPercentChance.length
						}
					}
					fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
						if(err) console.log(err);
					});	
					fs.writeFile("./rattokens.json", JSON.stringify(rattokens), (err) => {
						if(err) console.log(err);
					});	
					
					
			} else {
				
				let time = ms(timeout - (Date.now() - cooldowns[user.id].daily));
				
				message.channel.send(`You don't have enough Rat Tokens. Next gimme available in ${time.hours}h ${time.minutes}m ${time.seconds}s`);
				
			}
		}
			
			
	}
		
	if (command === "inv" || command === "inventory")
	{
		
		if(!inventories[user.id]) {
			inventories[user.id] = {
				name: user.tag,
				inventory: [],
				goop: 0
			}
			fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
				if(err) console.log(err);
			});	
		}
		inventories[user.id].inventory.sort(function(a, b) {
			var nameA = a.name.toUpperCase(); // ignore upper and lowercase
			var nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}

			// names must be equal
			return 0;
		});
		inventories[user.id].inventory.sort(function(a, b) {
			var rarityA = 0
			var rarityB = 0
			for (var i=0;i<rarities.length;i++){
				if (a.rarity==rarities[i])
				{
					rarityA=i
				}
				if (b.rarity==rarities[i])
				{
					rarityB=i
				}
			}
			if (rarityA < rarityB) {
				return -1;
			}
			if (rarityA > rarityB) {
				return 1;
			}

			// names must be equal
			return 0;
		});
		user.send(`You have: `);
		user.send(`Goop: ${inventories[user.id].goop}`);
		for (var i=0;i<inventories[user.id].inventory.length;i++){
			
			var embed = new Discord.MessageEmbed();
			
			for (var x=0;x<rarities.length;x++){
				if (inventories[user.id].inventory[i].rarity === rarities[x])
				{
					embed.setColor(rarityColors[x]);
				}
					
			}
			embed.setThumbnail(inventories[user.id].inventory[i].image);
			embed.setTitle(inventories[user.id].inventory[i].name);
			embed.addField("Inventory Position",i+1,false);
			embed.addField("Rarity",inventories[user.id].inventory[i].rarity,true);
			embed.addField("Level",inventories[user.id].inventory[i].level,true);
			embed.addField("Health",inventories[user.id].inventory[i].health,true);
			embed.addField("Attack",inventories[user.id].inventory[i].attack,true);
			embed.addField("Defense",inventories[user.id].inventory[i].defense,true);
			user.send(embed);
		}
		
		
		
	}
	if (command === "update")
	{
		for (var key in inventories) {
			
			
		
			for (var i=0;i<inventories[key].inventory.length;i++){
				
				inventories[key].inventory[i] = characterUpdater(inventories[key].inventory[i])
			}	
		}
		fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
			if(err) console.log(err);
		});	
		
	}
	
	if (command === "shortinv")
	{
		var shortinvarray = []
						var shortinvmessage = "Inventory: "
						for (var x =0;x<inventories[user.id].inventory.length;x++)
						{
							if ((shortinvmessage+"\n"+(x+1)+" "+inventories[user.id].inventory[x].rarity+" "+inventories[user.id].inventory[x].name+", level "+inventories[user.id].inventory[x].level).length <2000)
								shortinvmessage +="\n"+(x+1)+" "+inventories[user.id].inventory[x].rarity+" "+inventories[user.id].inventory[x].name+", level "+inventories[user.id].inventory[x].level
							else 
							{
								shortinvarray.push(shortinvmessage)
								shortinvmessage = ""
							}
							if(x===(inventories[user.id].inventory.length)-1)
							{
								shortinvarray.push(shortinvmessage)
							}
						}
						for (var y = 0;y<shortinvarray.length;y++)
						{
							user.send(shortinvarray[y]);
						}
	}
	
	if (command === "goop")
	{
		if(!inventories[user.id]) {
			inventories[user.id] = {
				name: user.tag,
				inventory: [],
				goop: 0
			}
			fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
				if(err) console.log(err);
			});	
		}
		
		if(!args.length)
		{
			user.send("To goop a rat, put a number after !goop depending on the order in your !inv")
			
		} else if (isNaN(Number(args[0]))) {
			
			user.send("To goop a rat, put a number after !goop depending on the order in your !inv")
			
		} else if (Number(args[0]%1!=0)) {
			
			user.send("Use a whole number")
			
		}else {
			var gooped = (Number(args[0])) - 1
			if (gooped >= inventories[user.id].inventory.length || gooped<0)
			{
				user.send("That number is too big or small")
			} else {
				for (var i=0;i<rarities.length;i++)
				{
					
					if(inventories[user.id].inventory[gooped].rarity===rarities[i])
					{
						inventories[user.id].goop+=rarityGoopGiven[i]
						removed = inventories[user.id].inventory.splice(Number(args[0])-1,1)
						user.send(`You gooped ${removed[0].name}, giving you ${rarityGoopGiven[i]}`)
						
						var shortinvarray = []
						var shortinvmessage = "Inventory: "
						for (var x =0;x<inventories[user.id].inventory.length;x++)
						{
							if ((shortinvmessage+"\n"+(x+1)+" "+inventories[user.id].inventory[x].rarity+" "+inventories[user.id].inventory[x].name+", level "+inventories[user.id].inventory[x].level).length <2000)
								shortinvmessage +="\n"+(x+1)+" "+inventories[user.id].inventory[x].rarity+" "+inventories[user.id].inventory[x].name+", level "+inventories[user.id].inventory[x].level
							else 
							{
								shortinvarray.push(shortinvmessage)
								shortinvmessage = ""
							}
							if(x===(inventories[user.id].inventory.length)-1)
							{
								shortinvarray.push(shortinvmessage)
							}
						}
						for (var y = 0;y<shortinvarray.length;y++)
						{
							user.send(shortinvarray[y]);
						}
						i=rarities.length;
					}
				
				}	
			}
			
		}
		
		fs.writeFile("./inventories.json", JSON.stringify(inventories), (err) => {
			if(err) console.log(err);
		});	
		
	}
	
	
	
	
	if ((command === "bal" || command === "balance" || command === "rattokens" || command === "tokens")&&(message.channel.id === "670138307471999007"))
	{
		if(!rattokens[user.id]) {
			message.channel.send(`${user} has 0 Rat Tokens.`);
		} else {
		
		
			message.channel.send(`${user} has ${rattokens[user.id].rattokens} Rat Tokens.`);
		}
		
		
	}
	
	if ((command === "gimme") &&(message.channel.id === "670138307471999007"))
	{
		if(!rattokens[user.id]) {
			rattokens[user.id] = {
				name: user.tag,
				rattokens: 10
			}
			if(!cooldowns[user.id]){
				cooldowns[user.id] = {
					name: user.tag,
					daily: Date.now()
				}
			}
			
			
			message.channel.send(`Daily ${reward} Rat Tokens collected! Current balance is ${rattokens[user.id].rattokens}.`);
		
			fs.writeFile("./cooldowns.json", JSON.stringify(cooldowns), (err) => {
				if(err) console.log(err);
			});
			fs.writeFile("./rattokens.json", JSON.stringify(rattokens), (err) => {
				if(err) console.log(err);
			});
			
		} else {
			
			if(!cooldowns[user.id]){
				cooldowns[user.id] = {
					name: user.tag,
					daily: Date.now()
				}
				
				
				rattokens[user.id].rattokens += reward;
				
				
				message.channel.send(`Daily ${reward} Rat Tokens collected! Current balance is ${rattokens[user.id].rattokens}.`);
				
				fs.writeFile("./cooldowns.json", JSON.stringify(cooldowns), (err) => {
					if(err) console.log(err);
				});
				fs.writeFile("./rattokens.json", JSON.stringify(rattokens), (err) => {
					if(err) console.log(err);
				});
			
			} else {
				
				if(timeout - (Date.now() - cooldowns[user.id].daily) > 0) {
					
					let time = ms(timeout - (Date.now() - cooldowns[user.id].daily));
					
					message.channel.send(`Next gimme available in ${time.hours}h ${time.minutes}m ${time.seconds}s`);
					
				} else {
					
					
					cooldowns[user.id].daily = Date.now();
					rattokens[user.id].rattokens += reward;
					

					
					fs.writeFile("./cooldowns.json", JSON.stringify(cooldowns), (err) => {
					if(err) console.log(err);
					});
					fs.writeFile("./rattokens.json", JSON.stringify(rattokens), (err) => {
					if(err) console.log(err);
					});
					
					
					message.channel.send(`Daily ${reward} Rat Tokens collected! Current balance is ${rattokens[user.id].rattokens}.`);
					
				}	
			}
		}
	}
	

	if (command === "crashma"){
		message.reply('Crashma bot! Goodbye.')
		.then(() => client.destroy())
	}
	if (command === "event"){
		message.channel.send(" ", {files: ["https://cdn.discordapp.com/attachments/670132835893641216/762855897332187197/chimp_time.mp4"]});
	}
	if (command === 'whomadeyou'){
		message.channel.send("I was made by Sam/Ern\'t The Nern\'t!");
	}
	
	
});

client.login(config.BOT_TOKEN);