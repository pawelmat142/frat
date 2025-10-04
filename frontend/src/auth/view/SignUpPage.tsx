

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Buton from "global/components/controls/Buton";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { toast } from "react-toastify";

const SignUpPage: React.FC = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [repeatEmail, setRepeatEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !repeatEmail || !password || !repeatPassword) {
			toast.error(t("signup.errorRequired"));
			return;
		}
		if (email !== repeatEmail) {
			toast.error(t("signup.errorEmailMatch"));
			return;
		}
		if (password !== repeatPassword) {
			toast.error(t("signup.errorPasswordMatch"));
			return;
		}
		setLoading(true);
		// TODO: Implement registration logic (API call)
		setTimeout(() => {
			toast.success(t("signup.success"));
			setLoading(false);
		}, 1000);
	};

	return (
		<div className="w-full px-5 py-3">
			<form className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color" onSubmit={handleSubmit}>
				<h2 className="text-lg font-bold mb-4">{t("signup.title")}</h2>
				<div className="flex flex-col gap-3">
					<Input
						name="email"
						label={t("signup.email")}
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="repeatEmail"
						label={t("signup.repeatEmail")}
						type="email"
						value={repeatEmail}
						onChange={e => setRepeatEmail(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="password"
						label={t("signup.password")}
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						fullWidth
					/>
					<Input
						name="repeatPassword"
						label={t("signup.repeatPassword")}
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
					{loading ? t("signup.registering") : t("signup.submit")}
				</Buton>
			</form>
		</div>
	);
};

export default SignUpPage;
