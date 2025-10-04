

import React, { useState } from "react";
import Input from "global/components/controls/Input";
import Buton from "global/components/controls/Buton";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { toast } from "react-toastify";

const SignUpPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [repeatEmail, setRepeatEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !repeatEmail || !password || !repeatPassword) {
			toast.error("All fields are required.");
			return;
		}
		if (email !== repeatEmail) {
			toast.error("Emails do not match.");
			return;
		}
		if (password !== repeatPassword) {
			toast.error("Passwords do not match.");
			return;
		}
		setLoading(true);
		// TODO: Implement registration logic (API call)
		setTimeout(() => {
			toast.success("Registration successful!");
			setLoading(false);
		}, 1000);
	};

	return (
		<div className="w-full px-5 py-3">
			<form className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color" onSubmit={handleSubmit}>
				<h2 className="text-lg font-bold mb-4">Sign Up</h2>
				<div className="flex flex-col gap-3">
					<Input
						name="email"
						label="Email"
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="repeatEmail"
						label="Repeat Email"
						type="email"
						value={repeatEmail}
						onChange={e => setRepeatEmail(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="password"
						label="Password"
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="repeatPassword"
						label="Repeat Password"
						type="password"
						value={repeatPassword}
						onChange={e => setRepeatPassword(e.target.value)}
						required
						fullWidth
					/>
				</div>
				<Buton
					mode={BtnModes.PRIMARY}
					size={BtnSizes.LARGE}
					fullWidth={true}
					className="mt-5"
					type="submit"
					disabled={loading || !email || !repeatEmail || !password || !repeatPassword}
				>
					{loading ? "Registering..." : "Sign Up"}
				</Buton>
			</form>
		</div>
	);
};

export default SignUpPage;
