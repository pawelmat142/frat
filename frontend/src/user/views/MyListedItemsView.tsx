import { UserListedItemReferenceTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerListItem from "employee/components/WorkerListItem";
import Loading from "global/components/Loading";
import { useGlobalContext } from "global/providers/GlobalProvider";
import OfferListItem from "offer/components/OfferListItem";
import { useTranslation } from "react-i18next";
import { FaUserSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const MyListedItemsView: React.FC = () => {

    const userCtx = useUserContext();
    const navigate = useNavigate();
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()

    const noResults = !userCtx.meCtx?.listedItems?.length;

    if (userCtx.loading) {
        return <Loading></Loading>
    }

    const items = userCtx.meCtx?.listedItems || [];

    return (
        <div className="list-view pt-0">

            {noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (

                <div className="results flex flex-col">

                    {([...items]).map((item, index) => {

                        if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                            return (
                                <WorkerListItem
                                    key={index}
                                    worker={item.data as WorkerI}
                                    languagesDictionary={globalCtx.dics.languages!}
                                    first={index === 0}
                                    last={index === (items?.length ?? 0) - 1}
                                ></WorkerListItem>
                            )
                        }

                        if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                            return (
                                <OfferListItem
                                    key={item.data.offerId}
                                    offer={item.data}
                                    first={index === 0}
                                    last={index === (items?.length ?? 0) - 1}
                                ></OfferListItem>
                            )
                        }
                        return null;

                    })}


                </div>

            )}
        </div>

    )
}

export default MyListedItemsView;