const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Si necesitas conectar con el frontend

const app = express();
const corsOptions = {
	origin: "http://localhost:3000", // Reemplaza con la URL de tu frontend
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true, // Permite el uso de cookies y autenticación
	optionsSuccessStatus: 204,
};

app.use(express.json({ limit: "50mb" })); // Ajusta el límite según tus necesidades
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors(corsOptions)); // Habilitar CORS si es necesario

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	service: "gmail",
	auth: {
		user: "consucordoba9@gmail.com",
		pass: "xbyg vheq klbg iwed",
	},
});

const template = (formValues) => {
	return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalles del Envío</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 24px;
      color: #333;
    }
    p {
      font-size: 16px;
      color: #555;
      margin: 10px 0;
    }
    .section {
      margin-bottom: 20px;
    }
    .section h2 {
      font-size: 20px;
      color: #444;
    }
    .details {
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }
    .details p {
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #888;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Detalles del Envío</h1>
    
    <div class="section">
      <h2>Tipo de Carga</h2>
      <p class="details">${formValues.tipoCarga}</p>
    </div>
    
    <div class="section">
      <h2>Detalles de Retiro</h2>
      <p class="details">
        <strong>Calle:</strong> ${formValues.entregaDomicilio.calle}<br>
        <strong>Número:</strong> ${formValues.entregaDomicilio.numero}<br>
        <strong>Localidad:</strong> ${formValues.entregaDomicilio.localidad}<br>
        <strong>Provincia:</strong> ${formValues.entregaDomicilio.provincia}<br>
        <strong>Referencia:</strong> ${formValues.entregaDomicilio.referencia}
      </p>
    </div>
    
    <div class="section">
      <h2>Detalles de Entrega</h2>
      <p class="details">
        <strong>Calle:</strong> ${formValues.retiroDomicilio.calle}<br>
        <strong>Número:</strong> ${formValues.retiroDomicilio.numero}<br>
        <strong>Localidad:</strong> ${formValues.retiroDomicilio.localidad}<br>
        <strong>Provincia:</strong> ${formValues.retiroDomicilio.provincia}<br>
        <strong>Referencia:</strong> ${formValues.retiroDomicilio.referencia}
      </p>
    </div>
    
    <div class="section">
      <h2>Fechas</h2>
      <p class="details">
        <strong>Fecha de Retiro:</strong> ${formValues.fechaEntrega}<br>
        <strong>Fecha de Entrega:</strong> ${formValues.fechaRetiro}
      </p>
    </div>
    <div class="footer">
      <p>Este es un correo automático. Por favor, no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`;
};

app.post("/send-email", (req, res) => {
	const { to, subject, formValues } = req.body;
	const htmlContent = template(formValues);

	let attachments = [];
	for (const img of formValues.imagenes) {
		attachments.push({ path: img });
	}
	const mailOptions = {
		from: "isw.noreply@gmail.com",
		to: to,
		subject: subject,
		html: template(formValues),
		attachments: attachments,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(500).send(error.toString());
		}
		res.status(200).send("Email sent: " + info.response);
	});
});

const PORT = 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
