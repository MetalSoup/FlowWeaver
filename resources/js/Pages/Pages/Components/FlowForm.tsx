import {useNode} from "@craftjs/core";
import ContentEditable from 'react-contenteditable'
import React, {useEffect, useState} from "react";
import {usePage} from "@inertiajs/react";

export const FlowForm = ({
                             forms,
                             flow_id = 0

                         }: {
    forms?: any,
    flow_id?: number,

}) => {


    const {connectors: {connect, drag}, hasSelectedNode, hasDraggedNode, actions: {setProp}} = useNode((state) => ({
        hasSelectedNode: state.events.selected,
        hasDraggedNode: state.events.dragged
    }));

    const {fields}: any = usePage().props;
    //console.log(fields);

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        !hasSelectedNode && setEditable(false)
    }, [hasSelectedNode]);

    {
        //console.log(forms)
    }
    /*    {console.log(flow_id)}*/
    {
        //console.log(forms[flow_id])
    }
    return (
        <div
            className={hasSelectedNode && "outline" || ""}
            ref={ref => ref && connect(drag(ref))}
        >
            <h1>Flow Form</h1>
            {
                Object.keys(forms[flow_id]).map((form: any, i) => {

                    return (
                        <div className={"bg-amber-200 mb-5"} key={i}>
                            {
                                forms[flow_id][form].data.formFields.map((form_field: any, field_key:number) => {
                                    {
                                       //find the field where the id is equal to the form_field.value
                                        let field_details = fields.find((field: any) => field.id == form_field.value)
                                        return (
                                            <div key={field_key}>
                                                <label htmlFor={field_details.name}>{field_details.label}</label>
                                                <input type={field_details.type || "text"} id={field_details.name} name={field_details.name}/>

                                            </div>
                                        )
                                    }
                                })
                            }


                        </div>
                    )


                })
            }

            <form style={{background: "green", minHeight: "100px", minWidth: "200px"}}>

            </form>


        </div>
    )
}

const FlowFormSettings = () => {
    const {actions: {setProp}, fontSize, flow_id} = useNode((node) => ({
        fontSize: node.data.props.fontSize,
        flow_id: node.data.props.flow_id
    }));

    return (
        <>

            <input
                type={"range"}
                defaultValue={fontSize}
                step={1}
                min={10}
                max={100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setProp((props: { fontSize: any; }) => props.fontSize = e.target.value);
                }}
            />
            <input
                type={"text"}
                defaultValue={flow_id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setProp((props: { flow_id: any; }) => props.flow_id = e.target.value);
                }}
            />

        </>
    )
}

FlowForm.craft = {

    related:
        {
            settings: FlowFormSettings
        }
}
