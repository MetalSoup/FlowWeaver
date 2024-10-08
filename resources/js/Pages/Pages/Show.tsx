import {SinglePageProps} from "@/types";
import {Interweave} from "interweave";

export default function ({ page }: SinglePageProps) {
    return (

            <Interweave content={page.data.content}  />

    );
}
