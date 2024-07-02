require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const botToken = process.env.API_KEY;
console.log(botToken);
const bot = new TelegramBot(botToken, { polling: true });
const axios = require("axios");

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
          : `${member.user?.first_name + " " + member.user?.last_name} `
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
bot.onText(/\/setMessage/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "write your message");
});
bot.onText(/\/start/, (msg) => {
  console.log("You said hii");
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Select and Manage your wallet:\nUse /Create_Wallet or /Import_Wallet to add wallet"
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = `Welcome! Select and Manage your wallet:\nPlease follow the instructions below:\n\nFor important updates, visit our channel:`;

  if (msg.photo) {
    photoId = msg.photo[0].file_id;
    photoSize = msg.photo[0].file_size;
    // Perform further actions with the received photo
    bot.sendMessage(chatId, "Image set successfully");
  }
  if (
    msg.text &&
    msg.text !== "/createPost" &&
    msg.text !== "/start" &&
    msg.text !== "/setMessage" &&
    msg.text !== "/setImage" &&
    msg.text !== "/tagall"
  ) {
    Text = msg.text;
    bot.sendMessage(chatId, message);
  }
  if (msg.text === "/createPost") {
    await createPost(chatId, Text);
  }
});

console.log("listening");
console.log(`fileId = ${photoId}`);
console.log(`Message = ${Text}`);
