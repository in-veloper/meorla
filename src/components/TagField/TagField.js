import React, { useState, useEffect, useRef } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import '@yaireo/tagify/dist/tagify.css';

function TagField({ suggestions = [], selectedRowValue, tagifyGridRef, category }) {
    const [whitelist, setWhitelist] = useState(suggestions);
    const [gridRef, setGridRef] = useState(null);
    const symptomTagifyRef = useRef();
    const medicationTagifyRef = useRef();
    const actionMatterTagifyRef = useRef();
    const treatmentMatterTagifyRef = useRef();
    
    const baseTagifySettings = {
        blacklist: [],
        maxTags: 20,
        backspace: true,                  // true: 마지막 Tag 삭제, edit: 마지막 태그 Edit, false: 아무 동작 하지 않음
        placeholder: category === "symptomTagField" ? "증상을 입력하세요" : 
                     category === "medicationTagField" ? "투약사항을 입력하세요" :
                     category === "actionMatterTagField" ? "조치사항을 입력하세요" :
                     category === "treatmentMatterTagField" ? "처치사항을 입력하세요" : "",
        editTags: 1,
        dropdown: {
          enabled: 0,
          maxItems: 100
        },
        callbacks: {}
    };

    useEffect(() => {
        if(suggestions) {
            if(category === "symptomTagField") symptomTagifyRef.current.settings.whitelist = suggestions;
            if(category === "medicationTagField") medicationTagifyRef.current.settings.whitelist = suggestions;
            if(category === "actionMatterTagField") actionMatterTagifyRef.current.settings.whitelist = suggestions;
            if(category === "treatmentMatterTagField") treatmentMatterTagifyRef.current.settings.whitelist = suggestions;
        }
        // debugger
        // if(category) {
        //     if(category === "symptomTagField") symptomTagifyRef.current.settings.placeholder = "증상을 입력하세요";
        //     if(category === "medicationTagField") medicationTagifyRef.current.settings.placeholder = "투약사항을 입력하세요";
        //     if(category === "actionMatterTagField") actionMatterTagifyRef.current.settings.placeholder = "조치사항을 입력하세요";
        //     if(category === "treatmentMatterTagField") treatmentMatterTagifyRef.current.settings.placeholder = "처치사항을 입력하세요";
        // }
    }, [suggestions, category]);

    useEffect(() => {
        if(tagifyGridRef) {
            setGridRef(tagifyGridRef);
        }
    }, [tagifyGridRef]);

    const handleChange = (e, category) => {
        const type = e.type;
        let selectedRowValue = e.detail.tagify.value[0].value;
    
        if(type === "add" && selectedRowValue) {
            if(category === "symptomTagField") symptomTagifyRef.current.addTags(selectedRowValue);
            if(category === "medicationTagField") medicationTagifyRef.current.addTags(selectedRowValue);
            if(category === "actionMatterTagField") actionMatterTagifyRef.current.addTags(selectedRowValue);
            if(category === "treatmentMatterTagField") treatmentMatterTagifyRef.current.addTags(selectedRowValue);

            gridRef.current.api.deselectAll();
            gridRef.current.api.clearFocusedCell();
        }else{
            if(whitelist.length === 0) {
                const newWhitelist = e.detail.tagify.value.map(item => item.value);
                setWhitelist(newWhitelist);
            }
        }
    };

    useEffect(() => {
        if(selectedRowValue) {
            handleChange({ detail: { tagify: { value: [{ value: selectedRowValue }] } }, type: "add" }, category)
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

    if(category === "symptomTagField") {
        return (
            <div className="form-group" style={{ marginBottom: 0 }}>
                <Tags tagifyRef={symptomTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />
            </div>
        );    
    }else if(category === "medicationTagField") {
        return (
            <div className="form-group" style={{ marginBottom: 0 }}>
                <Tags tagifyRef={medicationTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />
            </div>
        );
    }else if(category === "actionMatterTagField") {
        return (
            <div className="form-group" style={{ marginBottom: 0 }}>
                <Tags tagifyRef={actionMatterTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />
            </div>
        );
    }else if(category === "treatmentMatterTagField") {
        return (
            <div className="form-group" style={{ marginBottom: 0 }}>
                <Tags tagifyRef={treatmentMatterTagifyRef} settings={settings} tagifyGridRef={tagifyGridRef} />
            </div>
        );
    }
}

export default TagField;