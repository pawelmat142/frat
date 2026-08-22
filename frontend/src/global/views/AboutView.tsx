import Header from "global/components/Header";
import Logo from "global/components/Logo";

const AboutView: React.FC = () => (

    // TODO translacje
    <>
        <Header title="O aplikacji" />

        <main className="view-container flex flex-col gap-4 pb-8">
            <section className="card text-center">
                <div className="flex justify-center mb-3">
                    <Logo size={250} className="!ml-0" />
                </div>
                <h1 className="text-2xl font-bold primary-text">FRAT</h1>
                <p className="secondary-text mt-1">Find Rope Access Technicians</p>
                <p className="secondary-text mt-3">
                    FRAT to profesjonalna platforma dla osób i firm działających w branży prac wysokościowych.
                </p>
            </section>

            <section className="card p-6">
                <h2 className="text-lg font-bold primary-text mb-2">Po co powstał FRAT?</h2>
                <p className="secondary-text">
                    Ułatwiamy znalezienie właściwych specjalistów, ofert pracy i szkoleń w jednym miejscu.
                    Dzięki temu współpraca w branży staje się szybsza, prostsza i bardziej przejrzysta.
                </p>
            </section>

            <section className="card p-6">
                <h2 className="text-lg font-bold primary-text mb-3">Jakie problemy rozwiązujemy?</h2>
                <ul className="secondary-text list-disc pl-5 flex flex-col gap-2">
                    <li>Łatwiejsze dotarcie do zweryfikowanych specjalistów prac wysokościowych.</li>
                    <li>Jedno miejsce do publikowania i przeglądania ofert współpracy.</li>
                    <li>Lepsza widoczność kompetencji, certyfikatów i dostępności wykonawców.</li>
                    <li>Prostszy dostęp do szkoleń oraz ich organizatorów.</li>
                </ul>
            </section>
        </main>
    </>
);

export default AboutView;