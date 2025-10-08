import { Controller, Get, Res } from "@nestjs/common";
import express from "express";

@Controller()
export class AppController {
  @Get("/")
  getHome(@Res() res: express.Response) {
    res.send(`
      <html>
        <head>
          <title>Welcome</title>
        </head>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h1>🚀 Welcome to iKafil API</h1>
          <p>This is the backend main page.</p>
          <a href="api/docs">Swagger Documentation</a>
        </body>
      </html>
    `);
  }
}
