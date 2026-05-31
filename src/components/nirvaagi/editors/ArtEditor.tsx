import React from 'react';
import { StandardListEditor } from './StandardListEditor';

export const ArtEditor = (props) => {
    return (
        <>
            <StandardListEditor {...props} collection={props.collection || "arts"} />
        </>
    );
};
