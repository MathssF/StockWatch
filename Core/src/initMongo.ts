import { connectMongo } from "./mongoClient";
import { Message } from "./models/message";

const run = async () => {
  await connectMongo();
  const message = new Message({ content: "Hello from Mongoose!" });
  await message.save();
  console.log("Message saved:", message);
};

run();
