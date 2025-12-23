import Loading from "global/components/Loading";
import { useEffect, useState } from "react";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { FeedbackI } from "@shared/interfaces/FeedbackI";
import { FeedbackService } from "global/services/FeedbackService";
import { DateUtil } from "@shared/utils/DateUtil";

const AdminFeedbacks: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<FeedbackI[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackI | null>(null);

    const confirm = useConfirm();

    const _initFeedbacks = async () => {
        try {
            setLoading(true);
            const _feedbacks = await FeedbackService.list();
            if (_feedbacks) {
                setFeedbacks(_feedbacks);
            } else {
                setFeedbacks([])
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        _initFeedbacks();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const onSelectFeedback = (feedback: FeedbackI) => {
        setSelectedFeedback(feedback)
    }

    const handleFeedbackAction = async (feedback: FeedbackI) => {
        const confirmed = await confirm({
            message: "Are you sure you want to delete this feedback? This action cannot be undone.",
        });
        if (!confirmed) return; 

        try {
            setLoading(true);
            await FeedbackService.deleteFeedback(String(feedback.feedbackId));
            await _initFeedbacks();
            toast.success("Feedback deleted successfully");
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const handleRefresh = async (feedback: FeedbackI) => {
        if (feedback) {
            const newFeedbacks = feedbacks.map(f => {
                if (f.feedbackId === feedback.feedbackId) {
                    return feedback
                }
                return f
            })
            setFeedbacks(newFeedbacks)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Feedbacks</h2>

                <h2 className="font-mono font-bold mb-2 mt-10">List of feedbacks:</h2>

                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">message</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">uid</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Contact Email</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">Created</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No feedbacks found.</td>
                                </tr>
                            ) : (
                                feedbacks.map((feedback, idx) => {
                                    const isSelected = selectedFeedback?.feedbackId === feedback.feedbackId;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover-bg transition cursor-pointer${isSelected ? ' active' : ''}`}
                                            style={{ userSelect: 'none' }}
                                            onClick={() => onSelectFeedback(feedback)}
                                        >
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{feedback.status}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{feedback.message}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{feedback.uid}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{feedback.contactEmail}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{DateUtil.displayDate(feedback.createdAt)}</td>

                                            <td className="px-6 py-3 border-b border-color primary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleFeedbackAction(feedback)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

                {/* <SelectedUser user={selectedUser} onRefresh={handleRefresh} /> */}

            </div>
        </div>
    )
}

export default AdminFeedbacks;