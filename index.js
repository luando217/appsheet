require("dotenv").config(); // Load biến môi trường từ file .env

const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel], // để bot có thể gửi DM
});

client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);
});

client.login(DISCORD_BOT_TOKEN);

app.post("/webhook", async (req, res) => {
  console.log("Webhook received:", req.body); // log dữ liệu nhận được

  const data = req.body;

  const userId = data.discord_id; // ID Discord người nhận tin nhắn
  const jobName = data["Job Name"] || data.job_name || "Chưa có tên job";
  const qcApp = data["QC APP"] || data.QC_APP || "Chưa có QC APP";
  const userName =
    data["_Per user Settings[UID]"] || data.user || "Không rõ người gửi";
  const clientName = data.Client || data.client || "Chưa có tên khách";
  const serviceName = data.Service || data.service || "Chưa có gói sản phẩm";

  const messageText =
    `📌 Job: **${jobName}** vừa **${qcApp}**\n` +
    `👤 Bởi: **${userName}**\n` +
    `--------------------------\n` +
    `👥 Tên khách: **${clientName}**\n` +
    `📝 Gói sản phẩm: **${serviceName}**`;

  try {
    console.log(`Đang fetch user với ID: ${userId}`);
    const user = await client.users.fetch(userId);
    console.log(`Đã fetch user: ${user.tag}`);
    await user.send(messageText);
    console.log(`✅ Đã gửi DM tới user ${userId}`);
    res.status(200).send("Đã gửi tin nhắn thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi gửi DM:", error);
    res
      .status(500)
      .send(`Không thể gửi DM tới user này. Lỗi: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
