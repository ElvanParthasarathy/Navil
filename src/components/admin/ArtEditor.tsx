import React from 'react';
import { StandardListEditor } from './StandardListEditor';

export const ArtEditor = (props) => {
    return (
        <div>
            <StandardListEditor {...props} collection={props.collection || "arts"} />
        </div>
    );
};
