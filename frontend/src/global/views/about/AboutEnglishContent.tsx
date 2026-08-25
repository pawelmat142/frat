import Logo from "global/components/Logo";

interface AboutEnglishContentProps {
    isDesktop: boolean;
}

const AboutEnglishContent: React.FC<AboutEnglishContentProps> = ({ isDesktop }) => (
    <>
        <section className="card text-center">
            <div className="flex justify-center mb-3">
                <Logo size={isDesktop ? 250 : 150} className="!ml-0" />
            </div>
            <h1 className="text-2xl font-bold primary-text">FRAT</h1>
            <p className="secondary-text mt-1">Find Rope Access Technicians</p>
            <p className="secondary-text mt-3">
                A place for people working at height to connect, communicate clearly, and find the right people
                without losing time scrolling through countless group posts.
            </p>
        </section>

        <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold primary-text mb-2">Who we are</h2>
            <p className="secondary-text">
                We have spent years working in this field, so we know the pressure of filling a position at short
                notice, checking credentials, and reaching the right person while a job is waiting to start.
            </p>
            <p className="secondary-text mt-3">
                Calls to colleagues, posts in groups, and messages to several people are often how a team comes
                together. FRAT gives the industry one focused place to make that process simpler.
            </p>
        </section>

        <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold primary-text mb-2">Why FRAT exists</h2>
            <p className="secondary-text">
                FRAT helps technicians, companies, and project teams communicate more easily and work together faster.
                Find people close to the job, with the right qualifications and availability — whether you need support
                tomorrow or are building a team for a longer contract.
            </p>
        </section>

        <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold primary-text mb-3">Looking for the right specialist?</h2>
            <p className="secondary-text mb-3">
                FRAT helps you find a specialist who fits the task, not simply someone who works at height. Key details
                are visible from the start, so choosing the right person and getting in touch takes less time.
            </p>
            <ul className="primary-color list-disc pl-5 space-y-2">
                <li className="list-disc"><span className="secondary-text">Technicians with specific qualifications, such as IRATA or SPRAT, and relevant experience.</span></li>
                <li className="list-disc"><span className="secondary-text">Certificate expiry dates, work categories, languages, and willingness to travel.</span></li>
                <li className="list-disc"><span className="secondary-text">Search by location, availability, and qualifications when you need support at short notice.</span></li>
                <li className="list-disc"><span className="secondary-text">Professionals for a short assignment, a regular crew, or a longer contract.</span></li>
            </ul>
        </section>

        <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-bold primary-text mb-2">Looking for work or building a team?</h2>
            <p className="secondary-text">
                Post and browse work opportunities in one place. See where the job is based, when it starts, which
                skills and languages are needed, and what the terms are before you reach out.
            </p>
            <p className="secondary-text mt-3">
                When a profile or offer looks right, you can message the other person directly. Less searching across
                different groups and calls; more clear arrangements that help everyone get to work.
            </p>
        </section>
    </>
);

export default AboutEnglishContent;