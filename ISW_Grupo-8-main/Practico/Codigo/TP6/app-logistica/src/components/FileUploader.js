import React, { useState } from "react";

const FileUploader = ({ name, onFileUpload }) => {
	const [error, setError] = useState("");

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		const maxSize = 10 * 1024 * 1024;

		if (files.length > 3) {
			setError("No puedes subir más de 3 imágenes.");
			return;
		}
		const invalidFiles = files.filter((file) => file.size > maxSize);
		if (invalidFiles.length > 0) {
			setError("Cada imagen debe ser menor a 10 MB.");
			return;
		}

		setError("");
		onFileUpload(files);
	};

	return (
		<div>
			<input
				type="file"
				name={name}
				accept="image/png, image/jpeg"
				multiple
				onChange={handleFileChange}
			/>
			{error && <div style={{ color: "red" }}>{error}</div>}
		</div>
	);
};

export default FileUploader;
