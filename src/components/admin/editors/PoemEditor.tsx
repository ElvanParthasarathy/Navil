import React from 'react';
import { VariantListEditor } from './VariantListEditor';

export const PoemEditor = (props) => {
    return <VariantListEditor {...props} collection="poems" />;
};
