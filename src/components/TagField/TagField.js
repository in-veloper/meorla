import React, { useState, useEffect, useRef } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import '@yaireo/tagify/dist/tagify.css';

const baseTagifySettings = {
    blacklist: [],
    maxTags: 20,
    backspace: true,                  // true: 마지막 Tag 삭제, edit: 마지막 태그 Edit, false: 아무 동작 하지 않음
    placeholder: "증상 입력",
    editTags: 1,
    dropdown: {
      enabled: 0,
      maxItems: 100
    },
    callbacks: {}
};

function TagField({ suggestions = [], selectedRowValue, symptomGridRef }) {
    const [whitelist, setWhitelist] = useState(suggestions);
    const [symptomRef, setSymptomRef] = useState(null);
    const tagifyRef = useRef();
    
    useEffect(() => {
        if(suggestions) {
            tagifyRef.current.settings.whitelist = suggestions;
            // setWhitelist(suggestions);
        }
    }, [suggestions]);

    useEffect(() => {
        if(symptomGridRef) {
            setSymptomRef(symptomGridRef);
        }
    }, [symptomGridRef]);

    const handleChange = (e) => {
        const type = e.type;
        let selectedRowValue = e.detail.tagify.value[0].value;
    
        if(type === "add" && selectedRowValue) {
            tagifyRef.current.addTags(selectedRowValue);
            symptomRef.current.api.deselectAll();
            symptomRef.current.api.clearFocusedCell();
        }else{
            if(whitelist.length === 0) {
                const newWhitelist = e.detail.tagify.value.map(item => item.value);
                setWhitelist(newWhitelist);
            }
        }
    };

    useEffect(() => {
        if(selectedRowValue) {
            handleChange({ detail: { tagify: { value: [{ value: selectedRowValue }] } }, type: "add" })
        }
    }, [selectedRowValue]);

    const settings = {
        ...baseTagifySettings,
        whitelist: whitelist,
        callbacks: {
          // add: handleChange,
          // remove: handleChange,
          // blur: handleChange,
          // edit: handleChange,
          // invalid: handleChange,
          // click: handleChange,
          // focus: handleChange,
          // "edit:updated": handleChange,
          // "edit:start": handleChange
        }
    };
    
    return (
        <div className="form-group" style={{ marginBottom: 0 }}>
            <Tags tagifyRef={tagifyRef} settings={settings} symptomGridRef={symptomGridRef} />
        </div>
    );
}

export default TagField;