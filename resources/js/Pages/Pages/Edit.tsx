import DashboardLayout from '@/Layouts/DashboardLayout';
import {Head, router} from '@inertiajs/react';
import CustomEditor from "@/Pages/Pages/Editor";
import {SinglePageProps} from "@/types";
import {TopBar} from "@/Pages/Pages/Components/TopBar";
import {Container} from "@/Pages/Pages/Components/Container";
import {Card, CardBottom, CardTop} from "@/Pages/Pages/Components/Card";
import {Toolbox} from "@/Pages/Pages/Components/Toolbox";
import {SettingsPanel} from "@/Pages/Pages/Components/SettingsPanel";
import {Button} from "@/Pages/Pages/Components/Button";
import {Editor, Frame, Element} from "@craftjs/core";
import {Text} from "@/Pages/Pages/Components/Text";
import {useCallback, useEffect, useState} from "react";
import {FlowForm} from "@/Pages/Pages/Components/FlowForm";


export default function EditPage({auth, page,forms}: {auth: any, page: any, forms: any}) {
    //console.log(forms)


    const [json, setJson] = useState(page.data.content || {});``


    const onSave = ({content}:{content:string}) =>
    {
       // console.log(content);
        //save content to database
        if (!page.data.id) {
            router.post(route('pages.store'), {name: "pageName", content: content});
        } else {
            router.put(route('pages.update', page.data.id), {name: page.data.name, content: content});
        }

    }




    const resolver = {
        Card,
        Button,
        Text,
        Container,
        CardTop,
        CardBottom,
        FlowForm
    }

    return (
        <>


            <div className={"bg-gray-70 h-screen"}>
                {/*<button onClick = {() => onSave({content:"test"})}>Toggle</button>*/}


                <Editor resolver={resolver}>

                    <TopBar onSave={onSave}  className={"bg-gray-400"}/>
                    <div className={"bg-gray-300 flex flex-row min-h-full"}>

                        <div className={"bg-white flex-auto border border-amber-300"}>
                            <Frame data={json}>


                            </Frame>
                        </div>
                        <div className={"flex-initial bg-green-400"}>
                            <div>
                                <Toolbox className={"bg-gray-400 p-4"} forms={forms} flowID={3}/>
                                <SettingsPanel className={"bg-gray-500 p-4"}/>
                            </div>
                        </div>
                    </div>

                </Editor>
            </div>
        </>
    );
}
