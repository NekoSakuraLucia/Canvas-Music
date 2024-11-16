const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
require("dotenv").config();

const app = express();
const port = process.env.PORT ?? 5000

app.get("/api/music", async (req, res) => {
    const { videoID } = req.query;

    if (!videoID) {
        return res.status(400).send({ message: "Missing videoID parameter" })
    }

    try {
        // ดึงข้อมูลเพลงจาก Lavalink
        const response = await axios.get(`${process.env.LAVALINK_URL}/v4/loadtracks?identifier=${videoID}`, {
            headers: { Authorization: process.env.LAVALINK_PASSWORD },
        });

        const data = response.data;

        if (!data || data.loadType !== 'track') {
            console.error("Unexpected response from Lavalink:", data);
            return res.status(404).send({ message: "Track not found or invalid response" });
        }

        const track = data.data.info;

        // ข้อมูลเพลง
        const { title, author, length, artworkUrl } = track;
        const duration = new Date(length).toISOString().substr(11, 8);
        const artwork = artworkUrl || `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`; // ใช้ภาพจาก YouTube ถ้าไม่มี artworkUrl

        // สร้าง Canvas
        const canvas = createCanvas(1200, 400);
        const ctx = canvas.getContext("2d");

        // วาดพื้นหลัง
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // โหลดและวาดภาพปก
        const image = await loadImage(artwork);
        ctx.drawImage(image, 20, 20, 160, 160);

        // วาดข้อมูลเพลง
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`Title: ${title}`, 200, 50);
        ctx.fillText(`Author: ${author}`, 200, 90);
        ctx.fillText(`Duration: ${duration}`, 200, 130);

        // ส่งภาพในรูปแบบ PNG
        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer());
    } catch (error) {
        console.error(error);
    }
})

app.listen(port, () => console.log(`Server is Running on port ${port}`))