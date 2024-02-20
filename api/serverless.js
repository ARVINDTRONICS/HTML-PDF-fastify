const Fastify = require("fastify");

const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const app = Fastify({
  logger: true,
});

app.post("/html-to-pdf", async (request, reply) => {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
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
  //
  await browser.close();

  reply.code(200).send({ pdf: pdf.toString("base64") });
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
