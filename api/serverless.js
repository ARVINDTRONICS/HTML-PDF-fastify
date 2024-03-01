const Fastify = require("fastify");

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("@sparticuz/chromium");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

const app = Fastify({
  logger: true,
});

app.post("/html-to-pdf", async (request, reply) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      headless: "new",
      ignoreHTTPSErrors: true,
    };
  } else {
    options = {
      headless: "new",
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    };
  }

  try {
    const browser = await puppeteer.launch(options);
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
  } catch (err) {
    console.log(err);
    return null;
  }
});

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};
