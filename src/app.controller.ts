import { Controller, Get, Res } from "@nestjs/common";
import express from "express";

@Controller()
export class AppController {
  @Get("/")
  getHome(@Res() res: express.Response) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>iKafil API</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: "Inter", "Segoe UI", Roboto, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: #ffffff;
            padding: 48px 64px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
            text-align: center;
            max-width: 480px;
            animation: fadeIn 0.8s ease;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 12px;
            color: #1f2937;
          }
          .emoji {
            font-size: 2rem;
            margin-bottom: 8px;
          }
          p {
            font-size: 1rem;
            margin-bottom: 28px;
            color: #4b5563;
          }
          a {
            text-decoration: none;
            background-color: #111827;
            color: white;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.25s ease;
          }
          a:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
          }
          footer {
            margin-top: 24px;
            font-size: 0.85rem;
            color: #9ca3af;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🚀</div>
          <h1>Welcome to iKafil API</h1>
          <p>backend is running successfully.</p>
          <a href="/api/docs">View API Docs</a>
          <footer>Powered by NestJS</footer>
        </div>
      </body>
      </html>
    `);
  }
}
