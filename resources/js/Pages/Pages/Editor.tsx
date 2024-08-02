import grapesjs, {Editor} from 'grapesjs';
import GjsEditor, { Canvas } from '@grapesjs/react';
import {SinglePageProps} from "@/types";

export default function CustomEditor({page} : SinglePageProps) {
    const onEditor = (editor: Editor) => {
        console.log('Editor loaded', { editor });
        console.log(page.data.content);
    };

    return (
        <GjsEditor

            grapesjs={grapesjs}
            grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
            onEditor={onEditor}
            options={{
                height: '100vh',
                storageManager: false,
                projectData: {
                    assets: [
                        'https://via.placeholder.com/350x250/78c5d6/fff',
                        'https://via.placeholder.com/350x250/459ba8/fff',
                        'https://via.placeholder.com/350x250/79c267/fff',
                        'https://via.placeholder.com/350x250/c5d647/fff',
                        'https://via.placeholder.com/350x250/f28c33/fff',
                    ],
                    pages: [
                        {
                            name: 'Home page',
                            // todo figure out why this isn't working
                            component: page.data.content,

                        },
                    ],
                },


            }}





        >


            <div>
                <Canvas/>
            </div>
        </GjsEditor>
    );
}
