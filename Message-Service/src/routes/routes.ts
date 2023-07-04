import express, { Request, Response } from "express";
const amqp = require("amqplib");
import MessageModel from "../models/message";
const { spawn } = require("child_process");

const { randomBytes } = require("crypto");

const router = express.Router();

router.get("/api/message", (req: Request, res: Response) => {
  MessageModel.find({}, (err: any, message: any) => {
    if (err) {
      res.send(err);
    }
    res.status(200).json(message);
  });
});

router.post("/api/message", async (req: Request, res: Response) => {
  console.time("f1");
  const pythonScript = spawn("python", ["process_image.py"]);

  let newData = Buffer.from("");

  // Handle child process events and output
  pythonScript.stdout.on("data", (data: any) => {
    // Accumulate the received data
    newData = Buffer.concat([newData, data]);
  });

  pythonScript.stderr.on("data", (data: any) => {
    // Handle errors, if any
    console.error(data.toString());
  });

  pythonScript.on("close", async (code: any) => {
    // Convert the accumulated buffer to a string
    const newDataString = newData.toString("utf8");

    console.log(newDataString);

    // Parse the received JSON string
    let imageArray;
    try {
      imageArray = JSON.parse(newDataString);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return;
    }

    try {
      // const newMessage = new MessageModel(messageData);
      // await newMessage.save();
      console.log("Saved Message to DB");

      const connection = await amqp.connect("amqp://rabbitmq-service:5672");
      console.log("Connected to RabbitMQ");
      const channel = await connection.createChannel();
      console.log("Created RabbitMQ channel");
      await channel.assertExchange("message-exchange", "topic", {
        durable: false,
      });
      await channel.publish(
        "message-exchange",
        "messi",
        Buffer.from(JSON.stringify(imageArray))
      );
      console.log("Published to RabbitMQ");
      res.status(201).send(imageArray);
      console.timeEnd("f1");
    } catch (error) {
      res.status(500).send(error);
    }
  });
});

export { router };
