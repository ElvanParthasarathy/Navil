import React from 'react';
import { StandardListEditor } from './StandardListEditor';

export const DiaryEditor = (props) => {
    return <StandardListEditor {...props} collection="diary" />;
};
