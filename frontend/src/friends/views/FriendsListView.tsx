import { useAuthContext } from "auth/AuthProvider"
import { useParams } from "react-router-dom"

const FriendsListView: React.FC = () => {

    const { me, loading, firebaseUser } = useAuthContext()

    const { uid } = useParams<{ uid?: string }>()

    const isMyAccount = uid === me?.uid

    // TODO this view should be not permitted if not my account or not friend
    

    return (
        <div className="view-container">
            friends list
        </div>
    )
}

export default FriendsListView;