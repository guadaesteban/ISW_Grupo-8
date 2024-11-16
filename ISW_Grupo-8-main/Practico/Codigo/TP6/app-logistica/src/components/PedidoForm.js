import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { addDays } from "date-fns";
import DatePicker from "./DatePicker.js";
import FileUploader from "./FileUploader.js";
import { useSendEmail } from "../hooks/useSendEmail.js";
import { transportistas } from "../data/constants.js";
import { enqueueSnackbar } from "notistack";

const PedidoForm = () => {
	const { sendEmail } = useSendEmail();
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	// Validación del formulario
	const validationSchema = Yup.object().shape({
		fechaRetiro: Yup.date()
			.nullable()
			.required("La fecha de retiro es requerida")
			.min(today, "La fecha de retiro debe ser mayor o igual a hoy"),
		// Validación de fecha de entrega (mayor o igual a la fecha de retiro)
		fechaEntrega: Yup.date()
			.nullable()
			.required("La fecha de entrega es requerida")
			.min(
				Yup.ref("fechaRetiro"),
				"La fecha de entrega debe ser mayor o igual a la fecha de retiro"
			),
	});

	const toBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});

	//aca verificamos que los trnasportistas tengan los envios dentra de la zona de cobertura
	const verifyCobertureZone = (domicilioDeEntrega, domicilioDeRetiro) => {
		return transportistas.filter(
			(transportista) =>
				transportista.zonaDeCobertura.includes(
					domicilioDeEntrega.toLowerCase()
				) &&
				transportista.zonaDeCobertura.includes(domicilioDeRetiro.toLowerCase())
		);
	};
	const sendEmailToAllTransporters = async (transportistas, formValues) => {
		console.log(formValues);
		try {
			const base64Images = await Promise.all(
				formValues.fotos.map((file) => toBase64(file))
			);
			for (const transportista of transportistas) {
				await sendEmail(transportista.email, {
					...formValues,
					imagenes: base64Images,
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = (values) => {
		const transportistaFiltrados = verifyCobertureZone(
			values.entregaDomicilio.localidad,
			values.retiroDomicilio.localidad
		);
		if (transportistaFiltrados && transportistaFiltrados.length > 0) {
			sendEmailToAllTransporters(transportistaFiltrados, values).then(() => {
				enqueueSnackbar({
					message:
						"Pedido de envío enviado a todos los transportistas en la zona de cobertura",
					TransitionProps: {
						direction: "down",
					},
				});
			});
			return;
		}
		enqueueSnackbar({
			message:
				"No hay ningun transportista con zona de cobertura en las localidades de entrega y retiro",
			TransitionProps: {
				direction: "down",
			},
		});
	};

	return (
		<Formik
			initialValues={{
				tipoCarga: "",
				retiroDomicilio: {
					calle: "",
					numero: "",
					localidad: "",
					provincia: "",
					referencia: "",
				},
				entregaDomicilio: {
					calle: "",
					numero: "",
					localidad: "",
					provincia: "",
					referencia: "",
				},
				fechaRetiro: null,
				fechaEntrega: null,
				fotos: [],
			}}
			validationSchema={validationSchema} // Agregar el esquema de validación
			onSubmit={handleSubmit}
		>
			{({ setFieldValue }) => (
				<Form>
					<div>
						<label>Tipo de Carga</label>
						<Field as="select" name="tipoCarga">
							<option value="">Seleccionar</option>
							<option value="documentacion">Documentación</option>
							<option value="paquete">Paquete</option>
							<option value="granos">Granos</option>
							<option value="hacienda">Hacienda</option>
						</Field>
						<ErrorMessage name="tipoCarga" component="div" />
					</div>
					<div>
						<h3>Domicilio de Retiro</h3>
						<Field name="retiroDomicilio.calle" placeholder="Calle" />
						<ErrorMessage name="retiroDomicilio.calle" component="div" />
						<Field name="retiroDomicilio.numero" placeholder="Número" />
						<ErrorMessage name="retiroDomicilio.numero" component="div" />
						<Field name="retiroDomicilio.localidad" placeholder="Localidad" />
						<ErrorMessage name="retiroDomicilio.localidad" component="div" />
						<Field name="retiroDomicilio.provincia" placeholder="Provincia" />
						<ErrorMessage name="retiroDomicilio.provincia" component="div" />
						<Field name="retiroDomicilio.referencia" placeholder="Referencia" />
					</div>
					<div>
						<h3>Fecha de Retiro</h3>
						<DatePicker
							name="fechaRetiro"
							onChange={(val) => setFieldValue("fechaRetiro", val)}
						/>
						<ErrorMessage name="fechaRetiro" component="div" />
					</div>
					<div>
						<h3>Domicilio de Entrega</h3>
						<Field name="entregaDomicilio.calle" placeholder="Calle" />
						<ErrorMessage name="entregaDomicilio.calle" component="div" />
						<Field name="entregaDomicilio.numero" placeholder="Número" />
						<ErrorMessage name="entregaDomicilio.numero" component="div" />
						<Field name="entregaDomicilio.localidad" placeholder="Localidad" />
						<ErrorMessage name="entregaDomicilio.localidad" component="div" />
						<Field name="entregaDomicilio.provincia" placeholder="Provincia" />
						<ErrorMessage name="entregaDomicilio.provincia" component="div" />
						<Field
							name="entregaDomicilio.referencia"
							placeholder="Referencia"
						/>
					</div>
					<div>
						<h3>Fecha de Entrega</h3>
						<DatePicker
							name="fechaEntrega"
							onChange={(val) => setFieldValue("fechaEntrega", val)}
						/>
						<ErrorMessage name="fechaEntrega" component="div" />
					</div>

					<div>
						<h3>Adjuntar Fotos (opcional)</h3>
						<FileUploader
							name="fotos"
							onFileUpload={(files) => setFieldValue("fotos", files)}
						/>
					</div>

					<button type="submit">Enviar Pedido</button>
				</Form>
			)}
		</Formik>
	);
};

export default PedidoForm;
