import { SinglePageProps } from "@/types";
import { Interweave } from "interweave";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ({ page }: SinglePageProps) {
    const [content, setContent] = useState(page.data.content);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get('/dashboard/flows/4');
                const fetchedContent = "kjlkj";

                // Replace the [ki-path:1] tag with the fetched content
                const updatedContent = content.replace('[ki-path:1]', fetchedContent);
                setContent(updatedContent);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };

        if (content.includes('[ki-path:1]')) {
            fetchContent();
        }
    }, [content]);

    return <Interweave content={content} />;
}
