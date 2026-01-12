String.prototype.stripHTML = function () { return this.replace(/<[^>]+>/g, '') }
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json')
const token = config.token
const chatId = config.chatId
const bot = new TelegramBot(token, {polling: true});

/* -----KEYBOARD---- */
module.exports = function aws (mod) {
const keyboard = [
  [
    {
      text: 'All commands',
      callback_data: 'help'
    }
  ],
    [
      {
        text: 'LFGlist',
        callback_data: 'party_match_info' 
      }
    ]
    [
      {
        text: 'LFGcreate',
        callback_data: 'party_match_info' 
      }
    ]
  ];


/* -----WHISPER---- */
let myName
mod.hook('S_LOGIN', 14, (event) => {
  myName = event.name
   });

   mod.hook('S_WHISPER', 3, (event) => { 
		
		if (event.name === myName) return
		
	
		console.log('<' + event.name + '>:\n -> ' + event.message.stripHTML());
		
	
		bot.sendMessage(chatId, '<' + event.name + '>:\n -> ' + event.message.stripHTML());
	})

  /* -----INSPECT---- */
bot.onText(/\/inspect (.+)/, (msg, match) => {
  
  const resp = match[1];
  
  mod.send('C_REQUEST_USER_PAPERDOLL_INFO', 2, {
    name: resp
  }),
  
  mod.hook('S_USER_PAPERDOLL_INFO', 11, (event) => {
    let itemLVL, weapon, body, hand, feet, iPlayer
    iPlayer = event.name
	weapon = event.weapon
	body = event.body
	hand = event.hand
	feet = event.feet
	itemLVL = event.itemLevelInventory
	bot.sendMessage( chatId,' Nickname: ' + iPlayer + '\n ItemLVL: ' + itemLVL )
	
      if (weapon[0] == '8')
	  { bot.sendMessage(ChatId,'\n Weapon = gold')}
      if (weapon[0] == '9')
	  {bot.sendMessage(ChatId,'\n Weapon = mythic')}
      
      if ( body[0] == '8')
	  { bot.sendMessage(ChatId,'\n Body = gold')}
      if (body[0] == '9')
	  {bot.sendMessage(ChatId,'\n Body = mythic')}
      
      if ( hand[0] == '8')
	  {bot.sendMessage(ChatId,'\n Hand = gold')}
      if (hand[0] == '9')
	  {bot.sendMessage(ChatId,'\n Hand = mythic')}
		  
      if ( feet[0] == '8') 
	  {bot.sendMessage(ChatId,'\n Hand = gold')}
      if (feet[0] == '9')
	  {bot.sendMessage(ChatId,'\n Hand = mythic')}
      else 
	  {bot.sendMessage(ChatId, '\n undefined')}
}
)
}
);

/* -----INVITE---- */
bot.onText(/\/invite (.+)/, (msg, match) => {

  const resp = match[1];

  
  mod.send('C_REQUEST_CONTRACT', 1, {
    type: 4,
    name: resp
  })
  
(mod.hook('S_REPLY_REQUEST_CONTRACT', 1, (event) => {type: 4}), bot.sendMessage(chatId, 'Trying invite ' + resp))
}
)

 /* -----LFGcreate---- */
bot.onText(/\/LFGcreate (.+)/, (msg, match) => {
 
  const resp = match[1]; 

  
  mod.send('C_REGISTER_PARTY_INFO', 1, {
    message: resp
  }),
  bot.sendMessage(chatId, 'Сообщение поиска группы опубликованно: ' + resp)
}
)

/* -----LFGlist----- */
bot.onText(/\/LFGlist (.+)/, (msg, match) => {
  
  mod.send('C_REQUEST_PARTY_MATCH_INFO', 1)

    mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, (event) => {
    LFG = event.listings.message
    players = event.listings.playerCount
    if (players == 'undefined') {players = '0'}
    else if (LFG == 'undefined') {LFG = '0'}
    })

    bot.sendMessage(chatId, ' Название:' + LFG + '\n Игроков:' + players, {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}
)


/* -----QUEUE----- */
mod.hook('S_FIN_INTER_PARTY_MATCH', 1, (event) => {
  bot.sendMessage(chatId, 'Подбор группы завершен: ' + event.zone);
   });

/* -----JOIN----- */
mod.hook('S_OTHER_USER_APPLY_PARTY', 1, (event) => {
  bot.sendMessage(chatId, event.name + ' хочет присоединиться к группе');
   });

/* -----KEYBOARD CALLBACK----- */
bot.on('callback_query', (query) => {

  /* -----LFG----- */
    let LFG
    let players
    if (query.data === 'party_match_info') { 
      mod.send('C_REQUEST_PARTY_MATCH_INFO', 1)
      mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, (event) => {
        LFG = event.listings.message
        players = event.listings.playerCount
        if (players == 'undefined') {players = '0'}
        else if (LFG == 'undefined') {LFG = '0'}
      })
      bot.sendMessage(chatId, ' Название:' + LFG + '\n Игроков:' + players, {
        reply_markup: {
          inline_keyboard: keyboard
      }
      });
    }

    /* -----INVITE----- */
    if (query.data === 'invite') { // if invite
        bot.sendMessage(chatId, 'Write /invite + PlayerName for invite');

      /* -----HELP----- */
        if (query.data === 'help') {
          bot.sendMessage(chatId, 'All comands: \n /invite *PlayerName* \n /inspect *PlayerName* \n /lfg *Message*', {
            reply_markup: {
            inline_keyboard: keyboard
          }
        });
        }
    } else {
        bot.sendMessage(chatId, 'All comands: \n /invite PlayerName \n /inspect PlayerName', { 
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
  });
  bot.on("polling_error", console.log);
}
