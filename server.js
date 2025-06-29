require("dotenv").config();

const http = require("http");
const nodemailer = require("nodemailer");
const PORT = 3000;
const server = http.createServer((req, res) => {
  console.log(`Recebido ${req.method} em ${req.url}`);

  // Headers CORS para todas requisições
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Responder preflight
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/send-image") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      // Limite de 10MB
      if (body.length > 10e6) {
        req._destroy();
      }
    });
    req.on("end", async () => {
      try {
        const { image, email } = JSON.parse(body);
        if (!image || !image.startsWith("data:image")) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Imagem inválida");
        }
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.APP_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: `"Lar Doce Lar" <${process.env.EMAIL_ADDRESS}>`,
          to: `${email}`,
          subject: 'Submissão na exposição "Lar Doce Lar"',
          html:
            /*
          <html>
            <head>
              <style>
                html {
                  font-family: "Afacad", Arial, Helvetica, sans-serif;
                }
                body {
                  width: 100%;
                  max-width: 600px;
                }
                h1 {
                  text-align: center;
                }
                p.signature {
                  text-align: right;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <h1>Muito obrigada pela participação!</h1>

              <p>Esperamos que tenha sido do seu agrado e que faça a sua parte para ajudar a resolver a crise habitacional do Porto. Para começar, consulte o site da Habitação Hoje (<a href="https://www.habitacaohoje.org/">aqui</a>) para saber como ajudar. A partir deste pode:</p>

              <ul>
                <li>Assinar a newsletter e ficar a saber sobre todas as atividades da organização.</li>
                <li>Tornar-se associado, com o escalão que entender que mais se adequa a si.</li>
                <li>Acesso livre a informações organizadas sobre o temas como despejos, renovações de contratos...</li>
                <li>Acesso livre às reivindicações para a resolução do problema da habitação.</li>
                <li>Acesso livre a uma biblioteca digital diversa, com livros, vídeos e filmes que abordam a temática</li>
              </ul>

              <p>Aqui tens a sua criação! Também a pode descarregar em anexo :)</p>

              <img src="cid:imageResult" style="width: 100%; max-width: 200px; box-shadow: 0px 5px 5px #00000033;">

              <p class="signature">A equipa por detrás de Lar Doce Lar &lt;3</p>
            </body>
          </html>
          */
            `
          <html>
            <body style="font-family: "Afacad", Arial, Helvetica, sans-serif; width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; color: #000000;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; margin:0 auto;">
                  <tr>
                    <td align="center">
                      <h1 style="text-align:center; font-size:24px;">Muito obrigada pela participação!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="font-size:16px; line-height:1.5;">
                        Esperamos que tenha sido do seu agrado e que faça a sua parte para ajudar a resolver a crise habitacional do Porto. Para começar, consulte o site da Habitação Hoje 
                        (<a href="https://www.habitacaohoje.org/" target="_blank" style="color:#1a73e8;">aqui</a>) para saber como ajudar. A partir deste pode:
                      </p>
                      <ul style="font-size:16px; line-height:1.5; padding-left: 20px;">
                        <li>Assinar a newsletter e ficar a saber sobre todas as atividades da organização.</li>
                        <li>Tornar-se associado, com o escalão que entender que mais se adequa a si.</li>
                        <li>Acesso livre a informações organizadas sobre temas como despejos, renovações de contratos...</li>
                        <li>Acesso livre às reivindicações para a resolução do problema da habitação.</li>
                        <li>Acesso livre a uma biblioteca digital diversa, com livros, vídeos e filmes que abordam a temática.</li>
                      </ul>
                      <p style="font-size:16px; line-height:1.5;">
                        Aqui tens a sua criação! Também a pode descarregar em anexo :)
                      </p>
                      <p style="text-align:center; margin: 20px 0;">
                        <img src="cid:imageResult" alt="A sua criação" style="width:100%; max-width:200px; box-shadow: 0px 5px 5px #00000033; display:block; margin:0 auto;">
                      </p>
                      <p style="text-align:right; font-weight:bold; font-size:16px;">
                        A equipa por detrás de Lar Doce Lar &lt;3
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
          attachments: [
            {
              filename: "result.png",
              content: buffer,
              contentType: "image/png",
              cid: "imageResult",
            },
          ],
        });
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Email enviado com sucesso!");
      } catch (err) {
        console.error("Erro:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro ao enviar email.");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Não encontrado.");
  }
});
server.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
