import { SinglePageProps } from "@/types";
import { Interweave } from "interweave";
import { useState } from "react";
import Flow from "@/Components/Flow";

export default function ({ page }: SinglePageProps) {
    const [content, setContent] = useState(page.data.content);




    return (

        <>
            <Interweave content={content}/>
            <Flow data={page.data} flowID={3}/>
        </>



    );
}

