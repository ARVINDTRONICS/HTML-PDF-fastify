import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

const puppeteer = require("puppeteer");

fastify.post("/html-to-pdf", async (request, reply) => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  // Create a new page
  const page = await browser.newPage();
  const html = request.body.htmlContent;
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  await page.emulateMediaType("screen");
  const pdf = await page.pdf({
    margin: { top: "100px", right: "52px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });

  await browser.close();

  reply.code(200).send({ pdf: pdf.toString("base64") });
});

module.exports = HTMLtoPDF;
