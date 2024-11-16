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
        const { title, author, sourceName } = track;
        const artwork = track.artworkUrl || `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`; // ใช้ภาพจาก Lavalink หรือ YouTube

        // สร้าง Canvas
        const canvas = createCanvas(600, 180); // ขนาดของ Canvas
        const ctx = canvas.getContext("2d");

        // สร้างพื้นหลังโค้งมน
        ctx.fillStyle = "#2c2f33"; // สีพื้นหลัง
        const radius = 15;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();

        // วาดรูปภาพปก
        const image = await loadImage(artwork);
        ctx.drawImage(image, 20, 20, 140, 140); // กำหนดตำแหน่งและขนาดรูปภาพ

        // วาดข้อความ
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(title, 180, 50); // ชื่อเพลง
        ctx.font = "normal 16px Arial";
        ctx.fillStyle = "#b9bbbe";
        ctx.fillText(author, 180, 80); // ชื่อศิลปิน
        ctx.fillStyle = "#f9a8d4";
        ctx.fillText(sourceName, 180, 110); // Source Name

        // วาดปุ่มเล่น/หยุด
        ctx.fillStyle = "#5865f2";
        ctx.beginPath();
        ctx.arc(522, 90, 30, 0, Math.PI * 2, true); // ปุ่มวงกลม
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Arial";
        ctx.fillText("⏸", 508, 98); // ไอคอนปุ่ม (ใช้ Unicode)

        // วาดแถบเลื่อนด้านล่าง
        ctx.fillStyle = "#424549";
        ctx.fillRect(180, 140, 300, 5); // พื้นหลังแถบ
        ctx.fillStyle = "#f9a8d4";
        ctx.fillRect(180, 140, 150, 5); // แถบความคืบหน้า

        // ส่งภาพในรูปแบบ PNG
        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer());
    } catch (error) {
        console.error(error);
    }
})

app.listen(port, () => console.log(`Server is Running on port ${port}`))