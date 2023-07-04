import express from "express";
const amqp = require("amqplib");
import PeepModel from "./models/peep";
const { spawn } = require("child_process");

import mongoose from "mongoose";
import { router } from "./routes/routes";

const app = express();
app.use(express.json());
app.use(router);

async function processMessageMessage(msg: {
  content: { toString: () => any };
}) {
  console.time("f2");
  const content = JSON.parse(msg.content.toString());
  // const { messageId } = content;
  console.log(JSON.stringify(content));
  // Convert the multi-dimensional array to a JSON string
  const arrayJsonString = JSON.stringify(content);
  // console.log(messageId);

  // const peepData = {
  //   messageId: messageId,
  //   peeps: [],
  // };

  try {
    // const newPeep = new PeepModel(peepData);
    // await newPeep.save();

    // Spawn the Python script as a child process
    const pythonProcess = spawn("python", [
      "classify_image.py",
      arrayJsonString,
    ]);

    // Listen for data from the Python script's stdout
    pythonProcess.stdout.on("data", (data: any) => {
      console.log(`Python script output: ${data}`);
    });

    // Listen for any errors from the Python script
    pythonProcess.stderr.on("data", (data: any) => {
      // Handle errors, if any
      console.error(data.toString());
    });

    // Listen for the Python script to exit
    pythonProcess.on("close", (code: any) => {
      console.log(`Python script exited with code ${code}`);
    });
    console.log("Saved message event to DB");
    console.timeEnd("f2");
  } catch (error) {
    console.log(error);
  }
}

const Startup = async () => {
  try {
    await mongoose.connect("mongodb://peep-mongo-service:27017/peep");
    console.log("connected to mongo");

    const amqpConnection = await amqp.connect(
      "amqp://rabbitmq-service:5672",
      "heartbeat=30"
    );
    console.log("Peeps connected to RabbitMQ");
    const channel = await amqpConnection.createChannel();
    await channel.assertExchange("message-exchange", "topic", {
      durable: false,
    });
    console.log("Exchange created");

    await channel.assertQueue("peeps-messi-queue", { durable: false });
    await channel.bindQueue("peeps-messi-queue", "message-exchange", "messi.#");
    await channel.consume(
      "peeps-messi-queue",
      async (msg: { content: { toString: () => any } }) => {
        console.log("Processing message");
        await processMessageMessage(msg);
        await channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (error) {
    console.log(error);
  }

  app.listen(5100, () => {
    console.log("Peeps-Service listening on port 5100");
  });
};

Startup();
