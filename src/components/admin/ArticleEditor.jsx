import React from 'react';
import { StandardListEditor } from './StandardListEditor';

export const ArticleEditor = (props) => {
    return <StandardListEditor {...props} collection="articles" />;
};
