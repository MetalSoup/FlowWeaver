import Inertia from '@inertiajs/inertia-react';

export default function Flow({data,flowID}: {data: any, flowID: number}) {


    //get the flow data from flows show route based on the flowID


    Inertia.get(route('flows.show', {
        id: flowID    }),{
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
            console.log(page.props);
        }

    });




    return (
        <div>
            Flow {flowID}
        </div>
    );
}
