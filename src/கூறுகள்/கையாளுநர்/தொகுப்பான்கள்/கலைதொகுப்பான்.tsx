import React from 'react';
import { StandardListEditor } from './பட்டியல்தொகுப்பான்';

export const ArtEditor = (props) => {
    return (
        <>
            <StandardListEditor {...props} collection={props.collection || "arts"} />
        </>
    );
};
