import { useAuthContext } from "auth/AuthProvider"
import Button from "global/components/controls/Button"
import { BtnModes } from "global/interface/controls.interface"
import { Path } from "../../path"
import { FaIdCard } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

const FriendsListView: React.FC = () => {
    
    const { uid } = useParams<{ uid?: string }>()
    const { me } = useAuthContext()

    const navigate = useNavigate()
    const { t } = useTranslation()

    const isMyAccount = uid === me?.uid

    // TODO this view should be not permitted if not my account or not friend

    return (
        <div className="view-container">
            friends list


            <div className="flex flex-col gap-3 mt-6">

                <Button
                    fullWidth
                    mode={BtnModes.SECONDARY}
                    onClick={() => navigate(Path.FRIENDS_SEARCH)}
                >
                    <FaIdCard className="mr-2" />
                    {t('friends.search')}
                </Button>

            </div>
        </div>
    )
}

export default FriendsListView;