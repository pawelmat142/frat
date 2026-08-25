import Header from "global/components/Header";
import Logo from "global/components/Logo";
import { useGlobalContext } from "global/providers/GlobalProvider";

const AboutView: React.FC = () => {
    const { isDesktop } = useGlobalContext();

    return (

    <>
        <Header title="O aplikacji" />

        <main className="view-container !px-2 sm:!px-4 flex flex-col gap-4 pb-8">
            <section className="card text-center">
                <div className="flex justify-center mb-3">
                    <Logo size={isDesktop ? 250 : 150} className="!ml-0" />
                </div>
                <h1 className="text-2xl font-bold primary-text">FRAT</h1>
                <p className="secondary-text mt-1">Find Rope Access Technicians</p>
                <p className="secondary-text mt-3">
                    Miejsce dla ludzi z branży prac na wysokości, które ułatwia kontakt, sprawną komunikację
                    i znalezienie odpowiednich osób bez marnowania czasu na przeszukiwanie wielu grup.
                </p>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">Kim jesteśmy?</h2>
                <p className="secondary-text">
                    Sami od lat pracujemy w tej branży i znamy ją nie tylko z opowieści. Wiemy, jak wygląda szukanie
                    odpowiedniej osoby w krótkim terminie, sprawdzanie uprawnień i próba kontaktu, gdy zlecenie czeka.
                </p>
                <p className="secondary-text mt-3">
                    Telefony do znajomych, posty na grupach i wiadomości do kilku osób — często właśnie tak powstaje
                    ekipa. Chcemy to uprościć i dać branży jedno miejsce, w którym łatwiej znaleźć właściwy kontakt.
                </p>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">Po co powstał FRAT?</h2>
                <p className="secondary-text">
                    Chcemy, żeby komunikacja między technikami, firmami i ekipami była prostsza i sprawniejsza.
                    FRAT pomaga szybko znaleźć właściwe osoby — blisko miejsca pracy, z potrzebnymi kwalifikacjami
                    i dostępne wtedy, kiedy naprawdę są potrzebne. Czy to zlecenie na jutro, czy kontrakt na kilka
                    tygodni, mniej czasu idzie na szukanie, a więcej na działanie.
                </p>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-3">Szukasz specjalisty do pracy?</h2>
                <p className="secondary-text mb-3">
                    We FRAT możesz znaleźć specjalistę, który pasuje do konkretnego zadania, a nie przypadkową osobę
                    z branży. Od razu widać najważniejsze informacje, więc łatwiej podjąć decyzję i się skontaktować.
                </p>
                <ul className="primary-color list-disc pl-5 space-y-2">
                    <li className="list-disc">
                        <span className="secondary-text ">
                            Techników z konkretnymi uprawnieniami, na przykład IRATA lub SPRAT, oraz doświadczeniem.
                        </span>
                    </li>
                    <li className="list-disc">
                        <span className="secondary-text">
                            Informacje o ważności certyfikatów, zakresie prac, językach i gotowości do wyjazdu.
                        </span>
                    </li>
                    <li className="list-disc">
                        <span className="secondary-text">
                            Wyszukiwanie po okolicy, dostępności i kwalifikacjach — gdy potrzebujesz wsparcia w krótkim terminie.
                        </span>
                    </li>
                    <li className="list-disc">
                        <span className="secondary-text">
                            Specjalistów na krótkie zlecenie, do stałej ekipy albo na dłuższy kontrakt.
                        </span>
                    </li>
                </ul>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">Szukasz pracy lub budujesz ekipę?</h2>
                <p className="secondary-text">
                    Dodawaj i przeglądaj oferty pracy oraz współpracy w jednym miejscu. Możesz sprawdzić, gdzie będzie
                    realizowane zlecenie, od kiedy się zaczyna, jakich umiejętności i języków wymaga oraz jakie są warunki.
                </p>
                <p className="secondary-text mt-3">
                    Gdy znajdziesz właściwą osobę albo ofertę, możesz od razu napisać wiadomość. Mniej szukania
                    w wielu miejscach, więcej konkretnych ustaleń — tak, żeby wszystkim pracowało się łatwiej.
                </p>
            </section>
        </main>
    </>
    );
};

export default AboutView;