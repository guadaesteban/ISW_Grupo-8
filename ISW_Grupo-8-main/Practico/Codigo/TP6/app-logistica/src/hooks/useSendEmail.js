//hooks son fucniones con procesamiento que devuelven un estado
//creamos una funcion,
import axios from "axios";
export const useSendEmail = () => {
	const sendEmail = async (to, formValues) => {
		try {
			const response = await axios.post("http://localhost:3001/send-email", {
				to,
				subject: "Pedido de Envio",
				formValues,
			});

			if (response.status !== 200) {
				alert("Failed to send email");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return {
		sendEmail,
	};
};
