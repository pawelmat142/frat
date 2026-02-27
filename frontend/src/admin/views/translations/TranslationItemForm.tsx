import { TranslationItemDto } from "@shared/interfaces/TranslationI";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TranslationsSection: React.FC = () => {

    const params = useParams<{ path?: string }>()
    const path = params.path; 

    const [loading, setLoading] = useState(true);
    const [translationItem, setTranslationItem] = useState<TranslationItemDto | null>(null);

    useEffect(() => {
        const init = async () => {
            if (path) {
                try {
                    setLoading(true);
                    const item = await TranslationAdminService.getTranslationItem(path);
                    setTranslationItem(item);
                } catch (error) {
                    setTranslationItem(null);
                    console.error("Error fetching translation item:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setTranslationItem(null);
            }
        } 
        init();
    }, [path])

    
    return null
}

export default TranslationsSection;